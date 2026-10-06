// ============================================================================
// FEATURE: Clear conversation history — deletes all Conversations (which
// cascades to Messages via onDelete: Cascade in the schema), resetting
// analytics and leads to zero for this chatbot.
//
// Deliberately does NOT touch: Documents, DocumentChunks, ApiKeys, or
// UsageLog. Those represent real setup work and real billing-relevant
// usage — only conversational noise gets cleared.
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";

type RouteParams = { params: Promise<{ chatbotid: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const { chatbotid } = await params;
    const { orgId } = await requireOrg();

    const chatbot = await prisma.chatbot.findUnique({ where: { id: chatbotid } });
    if (!chatbot || chatbot.orgId !== orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { count } = await prisma.conversation.deleteMany({ where: { chatbotId: chatbotid } });

    return NextResponse.json({ success: true, deletedConversations: count });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}