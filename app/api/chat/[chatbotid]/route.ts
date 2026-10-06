// ============================================================================
// FEATURE: Public chat completion endpoint — what customer widgets call.
// Authenticated by API KEY (header), not login session — this is hit
// directly from strangers' browsers on the customer's website.
//
// Flow: validate key -> check rate limit -> check monthly quota -> retrieve
// relevant chunks -> build grounded prompt -> call LLM -> persist
// conversation/message -> log usage (tokens/latency) for billing/analytics.
//
// GUARDRAIL: if restrictToContext is on and no relevant chunks are found,
// the bot explicitly says it doesn't know, instead of hallucinating from
// the base model's general knowledge — this is the "grounded in your docs"
// promise from the landing page, actually enforced.
// ============================================================================

// ============================================================================
// FEATURE: Public chat completion endpoint — now streams the response.
//
// Response shape: plain text stream. Metadata (sessionId, whether to show
// the email-capture form) travels in response HEADERS, set before the
// stream begins, since the body is no longer JSON.
//
// The guardrail fallback (no relevant context found) is sent as a stream
// too — just a single immediate chunk — so the widget's reading logic is
// uniform regardless of which path produced the answer.
// ============================================================================

// ============================================================================
// FEATURE: Public chat completion endpoint — streaming, now with 3 memory modes:
// - simple:     last 6 messages (unchanged original behavior)
// - short_term: FULL session history, char-budget capped
// - long_term:  last 6 messages + semantically retrieved cross-session facts
//               about this specific visitor (requires visitorIdentifier),
//               plus triggers background extraction of new facts afterward
// ============================================================================
// ============================================================================
// FEATURE: Public chat completion endpoint — streaming, 3 memory modes
// (simple / short_term / long_term), AND dashboard Playground support.
//
// Two auth paths:
// 1. API key (Bearer header) — real customer/widget traffic. Rate-limited,
//    quota-enforced, usage-logged.
// 2. Session cookie (logged-in dashboard user, owner of the chatbot) — used
//    by the Playground page to test live without needing an API key first.
//    Skips rate limiting and quota consumption (it's your own testing, not
//    customer traffic) and skips UsageLog (requires a real apiKeyId, which
//    doesn't exist in this path).
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateApiKey } from "@/lib/auth/api-key";
import { checkRateLimit, isOverMonthlyQuota } from "@/lib/auth/rate-limit";
import { retrieveRelevantChunks } from "@/lib/ai/retrieve";
import { retrieveRelevantMemories } from "@/lib/ai/memory-retrieve";
import { generateChatCompletionStream } from "@/lib/ai/chat";
import { isOriginAllowed } from "@/lib/security/origin-check";
import { inngest } from "@/lib/inngest/client";
import { requireOrg } from "@/lib/auth/session";
import { nanoid } from "nanoid";

type RouteParams = { params: Promise<{ chatbotid: string }> };
const SHORT_TERM_MAX_CHARS = 16000;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "X-Session-Id, X-Request-Email",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request, { params }: RouteParams) {
  const start = Date.now();
  const { chatbotid } = await params;

  try {
    const authHeader = req.headers.get("authorization");
    const rawKey = authHeader?.replace("Bearer ", "") ?? null;

    let apiKey: Awaited<ReturnType<typeof validateApiKey>> = null;
    let chatbot: any = null;
    let service: { id: string; plan: any; messageQuota: number; messagesUsedThisPeriod: number } | null = null;
    let isPlaygroundSession = false;

    if (rawKey) {
      // --- Path 1: API key auth (real customer/widget traffic) ---
      apiKey = await validateApiKey(rawKey);

      if (!apiKey || apiKey.service.chatbot?.id !== chatbotid) {
        return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401, headers: corsHeaders() });
      }

      chatbot = apiKey.service.chatbot;
      service = apiKey.service;

      const requestOrigin = req.headers.get("origin");
      if (!isOriginAllowed(chatbot.allowedOrigins, requestOrigin)) {
        return NextResponse.json({ error: "This domain is not authorized to use this chatbot." }, { status: 403, headers: corsHeaders() });
      }

      const rateLimit = await checkRateLimit(apiKey.id, service.plan);
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429, headers: corsHeaders() });
      }
      if (isOverMonthlyQuota(service.messagesUsedThisPeriod, service.messageQuota)) {
        return NextResponse.json({ error: "Monthly message quota exceeded. Upgrade your plan to continue." }, { status: 403, headers: corsHeaders() });
      }
    } else {
      // --- Path 2: dashboard session auth (Playground — owner testing their own chatbot) ---
      try {
        const { orgId } = await requireOrg();
        chatbot = await prisma.chatbot.findUnique({
          where: { id: chatbotid },
          include: { service: true },
        });
        if (!chatbot || chatbot.orgId !== orgId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }
        service = chatbot.service;
        isPlaygroundSession = true;
        // No rate limit, no quota check here — this is the owner testing
        // their own chatbot, not customer-facing traffic.
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
      }
    }

    if (chatbot.status !== "READY") {
      return NextResponse.json({ error: "This chatbot isn't ready yet — no documents have finished processing." }, { status: 503, headers: corsHeaders() });
    }

    const body = await req.json().catch(() => null);
    const message: string | undefined = body?.message;
    let sessionId: string | undefined = body?.sessionId;
    const visitorIdentifier: string | undefined = body?.visitorIdentifier ?? (isPlaygroundSession ? "playground" : undefined);

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "message is required" }, { status: 400, headers: corsHeaders() });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "message too long (max 2000 chars)" }, { status: 400, headers: corsHeaders() });
    }
    if (chatbot.memoryType === "long_term" && !visitorIdentifier) {
      return NextResponse.json({ error: "visitorIdentifier is required for this chatbot" }, { status: 400, headers: corsHeaders() });
    }
    if (!sessionId) sessionId = nanoid();

    let conversation = await prisma.conversation.findFirst({
      where: { chatbotId: chatbotid, sessionId },
      orderBy: { createdAt: "desc" },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({ data: { chatbotId: chatbotid, sessionId } });
    }

    const chunks = await retrieveRelevantChunks(chatbotid, message);
    const hasContext = chunks.length > 0;

    // --- Guardrail path ---
    if (!hasContext && chatbot.restrictToContext) {
      const fallback =
        "I don't have information about that in the documents I was trained on. Could you rephrase, or ask something related to this site's content?";

      await prisma.$transaction([
        prisma.message.create({ data: { conversationId: conversation.id, role: "user", content: message } }),
        prisma.message.create({
          data: { conversationId: conversation.id, role: "assistant", content: fallback, wasAnswered: false, relatedQuestion: message },
        }),
      ]);

      const shouldRequestEmail = chatbot.leadCaptureEnabled && !conversation.visitorEmail;

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(fallback));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders(), "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Session-Id": sessionId, "X-Request-Email": String(shouldRequestEmail) },
      });
    }

    // --- Build history according to memory type ---
    let history: { role: "user" | "assistant"; content: string }[] = [];
    let memoryBlock = "";

    if (chatbot.memoryType === "short_term") {
      const allMessages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
      });
      history = allMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      let totalChars = history.reduce((sum, m) => sum + m.content.length, 0);
      while (history.length > 1 && totalChars > SHORT_TERM_MAX_CHARS) {
        const removed = history.shift()!;
        totalChars -= removed.content.length;
      }
    } else {
      const recentMessages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      history = recentMessages.reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      if (chatbot.memoryType === "long_term" && visitorIdentifier) {
        const memories = await retrieveRelevantMemories(chatbotid, visitorIdentifier, message);
        if (memories.length > 0) {
          memoryBlock = `\n\nWhat you know about this specific visitor from past conversations:\n${memories.map((m) => `- ${m.content}`).join("\n")}`;
        }
      }
    }

    const contextBlock = chunks.map((c, i) => `[Source ${i + 1}: ${c.filename}]\n${c.content}`).join("\n\n");
    const systemPrompt = `${chatbot.systemPrompt}

${hasContext ? `Use the following context to answer the user's question. If the context doesn't fully answer it, say what you don't know rather than guessing.\n\n${contextBlock}` : ""}${memoryBlock}`;

    let fullReply = "";
    const llmStream = generateChatCompletionStream(systemPrompt, history, message);

    const stream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await llmStream.next();
        if (done) {
          const latencyMs = Date.now() - start;

          const persistOps: any[] = [
            prisma.message.create({ data: { conversationId: conversation!.id, role: "user", content: message } }),
            prisma.message.create({ data: { conversationId: conversation!.id, role: "assistant", content: fullReply } }),
          ];

          // Only API-key-authenticated (real customer) traffic consumes
          // quota and generates a usage log — Playground testing does not.
          if (!isPlaygroundSession && apiKey && service) {
            persistOps.push(
              prisma.service.update({ where: { id: service.id }, data: { messagesUsedThisPeriod: { increment: 1 } } }),
              prisma.usageLog.create({
                data: {
                  apiKeyId: apiKey.id,
                  tokensIn: Math.ceil(message.length / 4),
                  tokensOut: Math.ceil(fullReply.length / 4),
                  latencyMs,
                  statusCode: 200,
                },
              })
            );
          }

          await prisma.$transaction(persistOps);

          if (chatbot.memoryType === "long_term" && visitorIdentifier) {
            await inngest.send({
              name: "chat/memory.extract",
              data: { conversationId: conversation!.id, chatbotId: chatbotid, visitorIdentifier },
            });
          }

          controller.close();
          return;
        }
        fullReply += value;
        controller.enqueue(new TextEncoder().encode(value));
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders(), "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Session-Id": sessionId, "X-Request-Email": "false" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500, headers: corsHeaders() });
  }
}