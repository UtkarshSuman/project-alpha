// ============================================================================
// FEATURE: Public completion endpoint for Tool Chatbots
// Parallel to /api/chat/[chatbotid] (RAG), but for type: TOOL services —
// same auth/rate-limit/quota pattern, different core logic (function
// calling instead of retrieval).
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateApiKey } from "@/lib/auth/api-key";
import { checkRateLimit, isOverMonthlyQuota } from "@/lib/auth/rate-limit";
import { isOriginAllowed } from "@/lib/security/origin-check";
import { requireOrg } from "@/lib/auth/session";
import { generateToolChatCompletion } from "@/lib/ai/tool-chat";
import { nanoid } from "nanoid";

type RouteParams = { params: Promise<{ serviceid: string }> };
 
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
  const { serviceid: serviceId } = await params;

  try {
    const authHeader = req.headers.get("authorization");
    const rawKey = authHeader?.replace("Bearer ", "") ?? null;
    let org: any = null;

    if (rawKey) {
      const apiKey = await validateApiKey(rawKey);
      if (!apiKey || apiKey.serviceId !== serviceId) {
        return NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401, headers: corsHeaders() });
      }
      org = apiKey.service.org;
      const rateLimit = await checkRateLimit(apiKey.id, org.plan);
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: corsHeaders() });
      }
    } else {
      try {
        const { orgId } = await requireOrg();
        const service = await prisma.service.findUnique({
          where: { id: serviceId },
          include: { org: true },
        });
        if (!service || service.orgId !== orgId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
        }
        org = service.org;
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
      }
    }

    const toolAgent = await prisma.toolAgent.findUnique({
      where: { serviceId },
      include: { tools: { where: { enabled: true } } },
    });

    if (!toolAgent) {
      return NextResponse.json({ error: "Tool agent not configured" }, { status: 404, headers: corsHeaders() });
    }

    if (rawKey) {
      const requestOrigin = req.headers.get("origin");
      if (!isOriginAllowed(toolAgent.allowedOrigins, requestOrigin)) {
        return NextResponse.json({ error: "This domain is not authorized." }, { status: 403, headers: corsHeaders() });
      }
    }

    if (isOverMonthlyQuota(org.messagesUsedThisPeriod, org.messageQuota)) {
      return NextResponse.json({ error: "Monthly quota exceeded." }, { status: 403, headers: corsHeaders() });
    }

    const body = await req.json().catch(() => null);
    const message: string | undefined = body?.message;
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "message is required" }, { status: 400, headers: corsHeaders() });
    }

    const reply = await generateToolChatCompletion(toolAgent.systemPrompt, [], message, toolAgent.tools);

    await prisma.organization.update({
      where: { id: org.id },
      data: { messagesUsedThisPeriod: { increment: 1 } },
    });

    return NextResponse.json({ reply, sessionId: nanoid() }, { headers: corsHeaders() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500, headers: corsHeaders() });
  }
}