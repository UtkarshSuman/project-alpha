// ============================================================================
// FEATURE: Retry ingestion for a FAILED document
// POST /api/chatbots/:chatbotid/documents/:documentid/retry
// Re-fires the same ingestion event. Safe to call repeatedly thanks to the
// idempotent embed-and-store step (old chunks get cleared before new ones
// are inserted).
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { inngest } from "@/lib/inngest/client";

type RouteParams = { params: Promise<{ chatbotid: string; documentid: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const { chatbotid, documentid } = await params;
    const { orgId } = await requireOrg();

    const document = await prisma.document.findUnique({
      where: { id: documentid },
      include: { chatbot: true },
    });

    if (!document || document.chatbotId !== chatbotid || document.chatbot.orgId !== orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.document.update({
      where: { id: documentid },
      data: { status: "PENDING", errorMessage: null },
    });

    await inngest.send({ name: "document/uploaded", data: { documentId: documentid } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}