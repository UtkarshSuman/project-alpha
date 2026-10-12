// ============================================================================
// FEATURE: Document Ingestion Pipeline
// Parses files (PDF / TXT), splits into overlapping chunks, generates
// embeddings, and stores them in pgvector DocumentChunk table.
//
// Can be called synchronously upon upload or asynchronously via Inngest.
// ============================================================================

import { prisma } from "@/lib/db/prisma";
import { getFromStorage } from "@/lib/storage";
import { chunkText } from "@/lib/ai/chunk";
import { embedTexts } from "@/lib/ai/embeddings";
import { PDFParse } from "pdf-parse";
import { nanoid } from "nanoid";

export async function processDocument(
  documentId: string
): Promise<{ success: boolean; chunkCount?: number; error?: string }> {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PARSING", errorMessage: null },
    });

    const buffer = await getFromStorage(document.storageUrl);
    let text = "";

    if (document.fileType === "pdf") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text || !text.trim()) {
      throw new Error("No extractable text found in this document");
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "EMBEDDING" },
    });

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      throw new Error("Document text could not be chunked");
    }

    // Clear old chunks for idempotency
    await prisma.documentChunk.deleteMany({ where: { documentId } });

    const BATCH_SIZE = 25;
    let chunkIndex = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await embedTexts(batch);

      for (let j = 0; j < batch.length; j++) {
        const content = batch[j];
        const vectorLiteral = `[${embeddings[j].join(",")}]`;

        await prisma.$executeRaw`
          INSERT INTO "DocumentChunk" (id, "documentId", content, "chunkIndex", "tokenCount", embedding)
          VALUES (${nanoid()}, ${documentId}, ${content}, ${chunkIndex}, ${Math.ceil(content.length / 4)}, ${vectorLiteral}::vector)
        `;
        chunkIndex++;
      }
    }

    // Finalize: mark document READY
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "READY", charCount: text.length, errorMessage: null },
    });

    // Mark chatbot READY
    if (document.chatbotId) {
      const chatbot = await prisma.chatbot.findUnique({
        where: { id: document.chatbotId },
      });
      if (chatbot && chatbot.status !== "READY") {
        await prisma.chatbot.update({
          where: { id: document.chatbotId },
          data: { status: "READY" },
        });
      }
    }

    return { success: true, chunkCount: chunkIndex };
  } catch (err: any) {
    console.error(`Ingestion error for document ${documentId}:`, err);
    await prisma.document
      .update({
        where: { id: documentId },
        data: {
          status: "FAILED",
          errorMessage: err?.message?.slice(0, 500) ?? "Ingestion failed",
        },
      })
      .catch(() => {});

    return { success: false, error: err?.message ?? "Ingestion failed" };
  }
}
