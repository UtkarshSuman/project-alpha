// ============================================================================
// FEATURE: Lead capture — public endpoint the widget calls when a visitor
// submits their email after the bot couldn't answer their question.
// Same auth model as the main chat endpoint: API key + origin restriction.
// also capture question along with email
// ============================================================================


import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateApiKey } from "@/lib/auth/api-key";
import { isOriginAllowed } from "@/lib/security/origin-check";
import { z } from "zod";

type RouteParams = { params: Promise<{ chatbotid: string }> };

const leadSchema = z.object({
  sessionId: z.string().min(1),
  email: z.string().email(),
  question: z.string().max(2000).optional(),
});

function corsHeaders() {
  return { "Access-Control-Allow-Origin": "*" };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request, { params }: RouteParams) {
  const { chatbotid } = await params;

  const authHeader = req.headers.get("authorization");
  const rawKey = authHeader?.replace("Bearer ", "") ?? null;
  const apiKey = await validateApiKey(rawKey);

  if (!apiKey || apiKey.chatbot.id !== chatbotid) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders() });
  }

  const requestOrigin = req.headers.get("origin");
  if (!isOriginAllowed(apiKey.chatbot.allowedOrigins, requestOrigin)) {
    return NextResponse.json({ error: "This domain is not authorized." }, { status: 403, headers: corsHeaders() });
  }

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400, headers: corsHeaders() });
  }

  const conversation = await prisma.conversation.findFirst({
    where: { chatbotId: chatbotid, sessionId: parsed.data.sessionId },
    orderBy: { createdAt: "desc" },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404, headers: corsHeaders() });
  }

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      visitorEmail: parsed.data.email,
      leadQuestion: parsed.data.question ?? conversation.leadQuestion,
    },
  });

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}