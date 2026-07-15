// ============================================================================
// FEATURE: API key list + create
// GET  /api/chatbots/:chatbotid/keys   -> list keys (prefix only, never raw)
// POST /api/chatbots/:chatbotid/keys   -> create key, returns RAW key ONCE
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { generateApiKey } from "@/lib/auth/api-key";

type RouteParams = { params: Promise<{ chatbotid: string }> };

async function assertOwnedChatbot(chatbotid: string, orgId: string) {
  const chatbot = await prisma.chatbot.findUnique({ where: { id: chatbotid } });
  if (!chatbot || chatbot.orgId !== orgId) return null;
  return chatbot;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { chatbotid } = await params;
    const { orgId } = await requireOrg();
    const chatbot = await assertOwnedChatbot(chatbotid, orgId);
    if (!chatbot) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const keys = await prisma.apiKey.findMany({
      where: { chatbotId: chatbotid },
      select: { id: true, name: true, keyPrefix: true, isActive: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ keys });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { chatbotid } = await params;
    const { orgId } = await requireOrg();
    const chatbot = await assertOwnedChatbot(chatbotid, orgId);
    if (!chatbot) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const name: string = body.name || "Default key";

    const { raw, prefix, hash } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: { chatbotId: chatbotid, name, keyPrefix: prefix, keyHash: hash },
    });

    // Raw key returned ONLY here, this one time — never again after this response.
    return NextResponse.json({ apiKey: { ...apiKey, rawKey: raw } }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}