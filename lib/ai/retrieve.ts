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

const SIMILARITY_THRESHOLD = 0.22; // cosine similarity threshold for vector retrieval
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
  // 1. Primary path: pgvector cosine similarity search
  try {
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

    const vectorChunks = results
      .map((r) => ({
        content: r.content,
        documentId: r.documentId,
        filename: r.filename,
        similarity: Math.max(0, 1 - r.distance),
      }))
      .filter((r) => r.similarity >= SIMILARITY_THRESHOLD);

    if (vectorChunks.length > 0) {
      return vectorChunks;
    }
  } catch (err) {
    console.warn("Vector search failed or produced error, trying fallback search:", err);
  }

  // 2. Secondary fallback: keyword / lexical search across ready chunks
  try {
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    const readyChunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          chatbotId,
          enabled: true,
          status: "READY",
        },
      },
      include: {
        document: { select: { filename: true } },
      },
      take: 25,
    });

    if (readyChunks.length === 0) return [];

    if (keywords.length > 0) {
      const scored = readyChunks.map((chunk) => {
        const text = chunk.content.toLowerCase();
        let matches = 0;
        for (const kw of keywords) {
          if (text.includes(kw)) matches++;
        }
        return {
          content: chunk.content,
          documentId: chunk.documentId,
          filename: chunk.document.filename,
          similarity: matches > 0 ? Math.min(0.9, 0.4 + (matches / keywords.length) * 0.5) : 0,
          matches,
        };
      });

      const matched = scored.filter((s) => s.matches > 0);
      matched.sort((a, b) => b.matches - a.matches);

      if (matched.length > 0) {
        return matched.slice(0, TOP_K).map((m) => ({
          content: m.content,
          documentId: m.documentId,
          filename: m.filename,
          similarity: m.similarity,
        }));
      }
    }

    // If small number of chunks overall for this chatbot, include them so answer can be grounded
    if (readyChunks.length <= 6) {
      return readyChunks.slice(0, TOP_K).map((c) => ({
        content: c.content,
        documentId: c.documentId,
        filename: c.document.filename,
        similarity: 0.5,
      }));
    }
  } catch (fallbackErr) {
    console.error("Lexical retrieval fallback error:", fallbackErr);
  }

  return [];
}