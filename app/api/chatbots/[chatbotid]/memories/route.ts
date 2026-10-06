// FEATURE: List memories (optionally filtered by visitor) + bulk-delete for a visitor
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";

type RouteParams = { params: Promise<{ chatbotid: string }> };

async function assertOwned(chatbotid: string, orgId: string) {
  const chatbot = await prisma.chatbot.findUnique({ where: { id: chatbotid } });
  if (!chatbot || chatbot.orgId !== orgId) return null;
  return chatbot;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { chatbotid } = await params;
    const { orgId } = await requireOrg();
    const chatbot = await assertOwned(chatbotid, orgId);
    if (!chatbot) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const visitorId = new URL(req.url).searchParams.get("visitorId");

    const memories = await prisma.userMemory.findMany({
      where: { chatbotId: chatbotid, ...(visitorId ? { visitorIdentifier: visitorId } : {}) },
      orderBy: { createdAt: "desc" },
      select: { id: true, visitorIdentifier: true, content: true, importance: true, createdAt: true },
    });

    return NextResponse.json({ memories });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { chatbotid } = await params;
    const { orgId } = await requireOrg();
    const chatbot = await assertOwned(chatbotid, orgId);
    if (!chatbot) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const visitorId = new URL(req.url).searchParams.get("visitorId");
    if (!visitorId) return NextResponse.json({ error: "visitorId query param required" }, { status: 400 });

    const { count } = await prisma.userMemory.deleteMany({ where: { chatbotId: chatbotid, visitorIdentifier: visitorId } });
    return NextResponse.json({ success: true, deleted: count });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}