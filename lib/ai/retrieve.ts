// ============================================================================
// FEATURE: Vector retrieval — the "R" in RAG
// Embeds the user's question, then finds the most similar chunks across
// all ENABLED, READY documents for this chatbot using pgvector's cosine
// distance operator (<=>). Only returns chunks above a minimum similarity
// threshold — this is what lets the bot say "I don't know" instead of
// forcing an answer from irrelevant context.
// ============================================================================

import { prisma } from "@/lib/db/prisma";
import { embedTexts } from "@/lib/ai/embeddings";

export type RetrievedChunk = {
  content: string;
  documentId: string;
  filename: string;
  similarity: number;
};

const SIMILARITY_THRESHOLD = 0.3; // cosine similarity; tune based on testing
const TOP_K = 5;

type RawChunkRow = {
  content: string;
  documentId: string;
  filename: string;
  distance: number;
};

export async function retrieveRelevantChunks(
  chatbotId: string,
  query: string
): Promise<RetrievedChunk[]> {
  const [queryEmbedding] = await embedTexts([query]);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  // Raw SQL: Prisma can't express pgvector's <=> (cosine distance) operator
  // or ORDER BY on it through the normal query builder.
  const results = await prisma.$queryRaw<RawChunkRow[]>`
    SELECT
      dc.content,
      dc."documentId",
      d.filename,
      (dc.embedding <=> ${vectorLiteral}::vector) AS distance
    FROM "DocumentChunk" dc
    JOIN "Document" d ON d.id = dc."documentId"
    WHERE d."chatbotId" = ${chatbotId}
      AND d.enabled = true
      AND d.status = 'READY'
    ORDER BY dc.embedding <=> ${vectorLiteral}::vector
    LIMIT ${TOP_K}
  `;

  // Cosine distance -> similarity: similarity = 1 - distance
  return results
    .map((r) => ({
      content: r.content,
      documentId: r.documentId,
      filename: r.filename,
      similarity: 1 - r.distance,
    }))
    .filter((r) => r.similarity >= SIMILARITY_THRESHOLD);
}
