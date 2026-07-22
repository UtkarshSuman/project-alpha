// ============================================================================
// FEATURE: Document upload + list
// GET  /api/chatbots/:chatbotid/documents  -> list documents (polled by UI)
// POST /api/chatbots/:chatbotid/documents  -> upload a PDF/TXT, store it,
//        create a PENDING Document row, and fire the ingestion job. Returns
//        immediately — actual parsing happens async via Inngest.
// ============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOrg, UnauthorizedError } from "@/lib/auth/session";
import { uploadToStorage } from "@/lib/storage";
import { inngest } from "@/lib/inngest/client";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
};

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

    const documents = await prisma.document.findMany({
      where: { chatbotId: chatbotid },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const fileType = ALLOWED_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json({ error: "Only PDF and TXT files are supported" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `chatbots/${chatbotid}/documents/${nanoid()}-${file.name}`;

    try {
      await uploadToStorage(key, buffer, file.type);
    } catch (storageErr) {
      console.error("Storage upload failed:", storageErr);
      return NextResponse.json(
        { error: "Could not upload file to storage. Check storage configuration." },
        { status: 502 }
      );
    }

    const document = await prisma.document.create({
      data: {
        chatbotId: chatbotid,
        filename: file.name,
        storageUrl: key,
        fileType,
        status: "PENDING",
      },
    });

    if (chatbot.status === "DRAFT") {
      await prisma.chatbot.update({ where: { id: chatbotid }, data: { status: "INGESTING" } });
    }

    await inngest.send({ name: "document/uploaded", data: { documentId: document.id } });

    return NextResponse.json({ document }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}