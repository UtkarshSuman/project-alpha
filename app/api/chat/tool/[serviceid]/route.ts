// ============================================================================
// FEATURE: Public completion endpoint for Tool Chatbots
// Parallel to /api/chat/[chatbotid] (RAG), but for type: TOOL services —
// same auth/rate-limit/quota pattern, different core logic (function
// calling instead of retrieval).
// Streams the final answer. Tool-execution rounds still happen non-streamed
// internally (see tool-chat.ts); only the natural-language answer streams.
// ============================================================================


import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateApiKey } from "@/lib/auth/api-key";
import { checkRateLimit, isOverMonthlyQuota } from "@/lib/auth/rate-limit";
import { isOriginAllowed } from "@/lib/security/origin-check";
import { generateToolChatCompletionStream } from "@/lib/ai/tool-chat";
import { summarizeIncrement } from "@/lib/ai/summarize-conversation";
import { nanoid } from "nanoid";

type RouteParams = { params: Promise<{ serviceId: string }> };

const HISTORY_LIMIT = 10;
const SUMMARIZE_TRIGGER = 20;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "X-Session-Id",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { serviceId } = await params;

  try {
    const authHeader = req.headers.get("authorization");
    const rawKey = authHeader?.replace("Bearer ", "") ?? null;
    const apiKey = await validateApiKey(rawKey);

    if (!apiKey || apiKey.serviceId !== serviceId) {
      return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401, headers: corsHeaders() });
    }

    const toolAgent = await prisma.toolAgent.findUnique({
      where: { serviceId },
      include: { tools: { where: { enabled: true } } },
    });
    if (!toolAgent) {
      return NextResponse.json({ error: "Agent not configured" }, { status: 404, headers: corsHeaders() });
    }

    const requestOrigin = req.headers.get("origin");
    if (!isOriginAllowed(toolAgent.allowedOrigins, requestOrigin)) {
      return NextResponse.json({ error: "This domain is not authorized." }, { status: 403, headers: corsHeaders() });
    }

    const service = apiKey.service;
    const rateLimit = await checkRateLimit(apiKey.id, service.plan);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: corsHeaders() });
    }
    if (isOverMonthlyQuota(service.messagesUsedThisPeriod, service.messageQuota)) {
      return NextResponse.json({ error: "Monthly quota exceeded." }, { status: 403, headers: corsHeaders() });
    }

    const body = await req.json().catch(() => null);
    const message: string | undefined = body?.message;
    let sessionId: string | undefined = body?.sessionId;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "message is required" }, { status: 400, headers: corsHeaders() });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "message too long (max 2000 chars)" }, { status: 400, headers: corsHeaders() });
    }
    if (!sessionId) sessionId = nanoid();

    let conversation = await prisma.agentConversation.findFirst({
      where: { toolAgentId: toolAgent.id, sessionId },
      orderBy: { createdAt: "desc" },
    });
    if (!conversation) {
      conversation = await prisma.agentConversation.create({ data: { toolAgentId: toolAgent.id, sessionId } });
    }

    const allMessages = await prisma.agentMessage.findMany({
      where: { conversationId: conversation.id, role: { in: ["user", "assistant"] } },
      orderBy: { createdAt: "asc" },
    });
    const recentMessages = allMessages.slice(-HISTORY_LIMIT);
    const olderMessages = allMessages.slice(0, -HISTORY_LIMIT);
    const unsummarizedOlder = conversation.summarizedUpTo
      ? olderMessages.filter((m) => m.createdAt > conversation!.summarizedUpTo!)
      : olderMessages;

    let memorySummary = conversation.memorySummary;
    if (allMessages.length > SUMMARIZE_TRIGGER && unsummarizedOlder.length > 0) {
      memorySummary = await summarizeIncrement(memorySummary, unsummarizedOlder.map((m) => ({ role: m.role, content: m.content })));
      const lastSummarized = unsummarizedOlder[unsummarizedOlder.length - 1];
      await prisma.agentConversation.update({
        where: { id: conversation.id },
        data: { memorySummary, summarizedUpTo: lastSummarized.createdAt },
      });
    }

    const systemPrompt = memorySummary
      ? `${toolAgent.systemPrompt}\n\nContext from earlier in this conversation:\n${memorySummary}`
      : toolAgent.systemPrompt;
    const history = recentMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    let fullReply = "";
    const llmStream = generateToolChatCompletionStream(systemPrompt, history, message, toolAgent.tools);

    const stream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await llmStream.next();
        if (done) {
          await prisma.$transaction([
            prisma.agentMessage.create({ data: { conversationId: conversation!.id, role: "user", content: message } }),
            prisma.agentMessage.create({ data: { conversationId: conversation!.id, role: "assistant", content: fullReply } }),
            prisma.service.update({ where: { id: service.id }, data: { messagesUsedThisPeriod: { increment: 1 } } }),
          ]);
          controller.close();
          return;
        }
        fullReply += value;
        controller.enqueue(new TextEncoder().encode(value));
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders(), "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Session-Id": sessionId },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500, headers: corsHeaders() });
  }
}