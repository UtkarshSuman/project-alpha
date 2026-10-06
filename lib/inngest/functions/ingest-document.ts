// ============================================================================
// FEATURE: Document ingestion pipeline (runs as a background job)
// Triggered by the "document/uploaded" event sent from the upload API route.
//
// Steps (each is independently retried by Inngest on failure):
// 1. Parse   — download original file from storage, extract raw text
// 2. Chunk   — split into overlapping windows
// 3. Embed   — batch-embed chunks, insert into DocumentChunk (raw SQL, since
//              the `embedding` column is a pgvector type Prisma can't
//              natively write to via its normal .create() API)
// 4. Finalize — mark document READY, flip chatbot to READY if this was its
//              first successfully ingested document
// ============================================================================


// ============================================================================
// FEATURE: Document ingestion pipeline (runs as a background job)
// Triggered by the "document/uploaded" event sent from the upload API route.
// Uses Inngest v4 API — triggers now live inside the config object (1st arg)
// instead of being a separate 2nd argument.
// ============================================================================

// ============================================================================
// FEATURE: Document ingestion pipeline — now with failure handling +
// idempotent embedding storage.
//
// RELIABILITY FIXES:
// 1. onFailure: when all retries are exhausted, mark the document FAILED
//    with a human-readable error message instead of leaving it stuck in
//    PARSING/EMBEDDING forever with no way to recover.
// 2. Idempotent embed-and-store: deletes any existing chunks for this
//    document FIRST, so a retried step (or a manual re-ingestion) never
//    produces duplicate chunks.
// ============================================================================

import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/db/prisma";
import { getFromStorage } from "@/lib/storage";
import { chunkText } from "@/lib/ai/chunk";
import { embedTexts } from "@/lib/ai/embeddings";
import { PDFParse } from "pdf-parse";
import { nanoid } from "nanoid";

export const ingestDocument = inngest.createFunction(
  {
    id: "ingest-document",
    triggers: { event: "document/uploaded" },
    retries: 2,

    // Called once ALL retries are exhausted for any step. This is the safety
    // net that prevents a document from being stuck forever with no signal
    // to the user or a way to retry.
    onFailure: async ({ event, error }) => {
      const originalEvent = event.data.event;
      const documentId = originalEvent?.data?.documentId as string | undefined;
      if (!documentId) return;

      const document = await prisma.document.findUnique({ where: { id: documentId } });
      if (!document) return;

      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: "FAILED",
          errorMessage: error?.message?.slice(0, 500) ?? "Ingestion failed after retries.",
        },
      });

      // If this was the chatbot's only/first document, flip it back to DRAFT
      // rather than leaving it silently stuck on INGESTING with nothing ready.
      const chatbot = await prisma.chatbot.findUnique({
        where: { id: document.chatbotId },
        include: { documents: { where: { status: "READY" } } },
      });
      if (chatbot && chatbot.status === "INGESTING" && chatbot.documents.length === 0) {
        await prisma.chatbot.update({ where: { id: chatbot.id }, data: { status: "DRAFT" } });
      }
    },
  },
  async ({ event, step }) => {
    const { documentId } = event.data as { documentId: string };

    // --- Step 1: parse ---
    const parsed = await step.run("parse-document", async () => {
      const document = await prisma.document.findUnique({ where: { id: documentId } });
      if (!document) throw new Error("Document not found");

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

      if (!text.trim()) throw new Error("No extractable text found in this document");

      return { text, chatbotId: document.chatbotId };
    });

    // --- Step 2: chunk ---
    const chunks = await step.run("chunk-text", async () => chunkText(parsed.text));

    // --- Step 3: embed + store (idempotent) ---
    await step.run("embed-and-store", async () => {
      await prisma.document.update({ where: { id: documentId }, data: { status: "EMBEDDING" } });

      // IDEMPOTENCY FIX: clear any chunks from a previous partial attempt
      // (whether an Inngest-internal retry of this exact step, or a manual
      // "retry ingestion" re-run) before inserting fresh ones. Without this,
      // retries after a partial failure produce duplicate chunks.
      await prisma.documentChunk.deleteMany({ where: { documentId } });

      const BATCH_SIZE = 50;
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

      return { chunkCount: chunkIndex };
    });

    // --- Step 4: finalize ---
    await step.run("finalize", async () => {
      const document = await prisma.document.update({
        where: { id: documentId },
        data: { status: "READY", charCount: parsed.text.length, errorMessage: null },
      });

      const chatbot = await prisma.chatbot.findUnique({ where: { id: document.chatbotId } });
      if (chatbot && chatbot.status !== "READY") {
        await prisma.chatbot.update({ where: { id: chatbot.id }, data: { status: "READY" } });
      }
    });

    return { success: true };
  }
);




// Note on failure handling: if a step throws after retries are exhausted, the document will stay stuck in PARSING/EMBEDDING rather than flipping to FAILED — Inngest's onFailure callback API varies by version, so rather than give you code that might not match your installed version, flag this as a known gap we'll harden in a later "reliability" pass. For now you can manually check stuck documents via the Inngest dashboard (below).