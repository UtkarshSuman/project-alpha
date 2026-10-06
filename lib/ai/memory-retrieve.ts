// ============================================================================
// FEATURE: Semantic memory retrieval for long-term memory chatbots
// Mirrors lib/ai/retrieve.ts's pattern exactly embeds the current message,
// finds the most relevant stored facts about THIS visitor via pgvector
// cosine similarity, instead of just returning the most recent/important
// ones regardless of relevance to what's actually being asked right now.
// ============================================================================

import { prisma } from "@/lib/db/prisma";
import { embedTexts } from "@/lib/ai/embeddings";

export type RetrievedMemory = { content: string; similarity: number };

const TOP_K = 5;

type RawMemoryRow = { content: string; distance: number };

export async function retrieveRelevantMemories(
  chatbotId: string,
  visitorIdentifier: string,
  query: string
): Promise<RetrievedMemory[]> {
  const [queryEmbedding] = await embedTexts([query]);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const results = await prisma.$queryRaw<RawMemoryRow[]>`
    SELECT content, (embedding <=> ${vectorLiteral}::vector) AS distance
    FROM "UserMemory"
    WHERE "chatbotId" = ${chatbotId}
      AND "visitorIdentifier" = ${visitorIdentifier}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${TOP_K}
  `;

  return results.map((r) => ({ content: r.content, similarity: 1 - r.distance }));
}