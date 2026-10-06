// FEATURE: Delete a single memory fact
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";

type RouteParams = { params: Promise<{ chatbotid: string; memoryid: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { chatbotid, memoryid } = await params;
    const { orgId } = await requireOrg();

    const memory = await prisma.userMemory.findUnique({ where: { id: memoryid }, include: { chatbot: true } });
    if (!memory || memory.chatbotId !== chatbotid || memory.chatbot.orgId !== orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.userMemory.delete({ where: { id: memoryid } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}