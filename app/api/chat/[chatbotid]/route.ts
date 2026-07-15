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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateApiKey } from "@/lib/auth/api-key";
import { checkRateLimit, isOverMonthlyQuota } from "@/lib/auth/rate-limit";
import { retrieveRelevantChunks } from "@/lib/ai/retrieve";
import { generateChatCompletion } from "@/lib/ai/chat";
import { nanoid } from "nanoid";

type RouteParams = { params: Promise<{ chatbotid: string }> };

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request, { params }: RouteParams) {
  const start = Date.now();
  const { chatbotid } = await params;

  try {
    // --- Auth: API key, not session ---
    const authHeader = req.headers.get("authorization");
    const rawKey = authHeader?.replace("Bearer ", "") ?? null;
    const apiKey = await validateApiKey(rawKey);

    if (!apiKey || apiKey.chatbot.id !== chatbotid) {
      return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401, headers: corsHeaders() });
    }

    const chatbot = apiKey.chatbot;
    const org = chatbot.org;

    // --- Rate limit (per-minute burst protection) ---
    const rateLimit = await checkRateLimit(apiKey.id, org.plan);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: corsHeaders() }
      );
    }

    // --- Monthly quota (billing enforcement) ---
    if (isOverMonthlyQuota(org.messagesUsedThisPeriod, org.messageQuota)) {
      return NextResponse.json(
        { error: "Monthly message quota exceeded. Upgrade your plan to continue." },
        { status: 403, headers: corsHeaders() }
      );
    }

    if (chatbot.status !== "READY") {
      return NextResponse.json(
        { error: "This chatbot isn't ready yet — no documents have finished processing." },
        { status: 503, headers: corsHeaders() }
      );
    }

    // --- Parse request ---
    const body = await req.json().catch(() => null);
    const message: string | undefined = body?.message;
    let sessionId: string | undefined = body?.sessionId;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "message is required" }, { status: 400, headers: corsHeaders() });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "message too long (max 2000 chars)" }, { status: 400, headers: corsHeaders() });
    }

    if (!sessionId) sessionId = nanoid();

    // --- Get or create conversation ---
    let conversation = await prisma.conversation.findFirst({
      where: { chatbotId: chatbotid, sessionId },
      orderBy: { createdAt: "desc" },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { chatbotId: chatbotid, sessionId },
      });
    }

    // --- Retrieve relevant context ---
    const chunks = await retrieveRelevantChunks(chatbotid, message);
    const hasContext = chunks.length > 0;

    if (!hasContext && chatbot.restrictToContext) {
      const fallback =
        "I don't have information about that in the documents I was trained on. Could you rephrase, or ask something related to this site's content?";

      await prisma.$transaction([
        prisma.message.create({ data: { conversationId: conversation.id, role: "user", content: message } }),
        prisma.message.create({
          data: { conversationId: conversation.id, role: "assistant", content: fallback, wasAnswered: false },
        }),
      ]);

      return NextResponse.json({ reply: fallback, sessionId }, { headers: corsHeaders() });
    }

    // --- Build grounded system prompt ---
    const contextBlock = chunks
      .map((c, i) => `[Source ${i + 1}: ${c.filename}]\n${c.content}`)
      .join("\n\n");

    const systemPrompt = `${chatbot.systemPrompt}

${hasContext ? `Use the following context to answer the user's question. If the context doesn't fully answer it, say what you don't know rather than guessing.\n\n${contextBlock}` : ""}`;

    // --- Recent history for multi-turn context (last 6 messages) ---
    const recentMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    const history = recentMessages
      .reverse()
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // --- Generate completion ---
    const reply = await generateChatCompletion(systemPrompt, history, message);

    // --- Persist messages ---
    await prisma.$transaction([
      prisma.message.create({ data: { conversationId: conversation.id, role: "user", content: message } }),
      prisma.message.create({ data: { conversationId: conversation.id, role: "assistant", content: reply } }),
    ]);

    // --- Increment usage + log (fire and forget-ish, but awaited for correctness) ---
    const latencyMs = Date.now() - start;
    await prisma.$transaction([
      prisma.organization.update({
        where: { id: org.id },
        data: { messagesUsedThisPeriod: { increment: 1 } },
      }),
      prisma.usageLog.create({
        data: {
          apiKeyId: apiKey.id,
          tokensIn: Math.ceil(message.length / 4),
          tokensOut: Math.ceil(reply.length / 4),
          latencyMs,
          statusCode: 200,
        },
      }),
    ]);

    return NextResponse.json({ reply, sessionId }, { headers: corsHeaders() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500, headers: corsHeaders() });
  }
}