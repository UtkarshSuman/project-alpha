// ============================================================================
// FEATURE: Single document — toggle enable/disable, delete
// PATCH  /api/chatbots/:chatbotid/documents/:documentid  -> enable/disable
//         without deleting (lets a customer temporarily exclude a doc from
//         retrieval without losing its embeddings)
// DELETE /api/chatbots/:chatbotid/documents/:documentid  -> removes from
//         storage + DB (cascades to its chunks automatically)
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { deleteFromStorage } from "@/lib/storage";

type RouteParams = { params: Promise<{ chatbotid: string; documentid: string }> };

async function getOwnedDocument(chatbotid: string, documentid: string, orgId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentid },
    include: { chatbot: true },
  });
  if (!document || document.chatbotId !== chatbotid || document.chatbot.orgId !== orgId) return null;
  return document;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { chatbotid, documentid } = await params;
    const { orgId } = await requireOrg();

    const document = await getOwnedDocument(chatbotid, documentid, orgId);
    if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const updated = await prisma.document.update({
      where: { id: documentid },
      data: { enabled: typeof body.enabled === "boolean" ? body.enabled : document.enabled },
    });

    return NextResponse.json({ document: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const { chatbotid, documentid } = await params;
    const { orgId } = await requireOrg();

    const document = await getOwnedDocument(chatbotid, documentid, orgId);
    if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteFromStorage(document.storageUrl).catch(() => {});
    await prisma.document.delete({ where: { id: documentid } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}