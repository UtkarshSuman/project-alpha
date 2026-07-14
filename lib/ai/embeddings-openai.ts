// ============================================================================
// FEATURE: Embeddings — turns text chunks into vectors for similarity search
// Using OpenAI's text-embedding-3-small (1536 dimensions, matches the
// vector(1536) column in prisma/schema.prisma). Batches requests since the
// API accepts an array of inputs per call — far cheaper than one call per chunk.
// ============================================================================

// ============================================================================
// FEATURE: Embeddings — PAID TIER implementation (OpenAI). Switch to this
// once you have a card + API key — see lib/ai/embeddings.ts for the switch.
// Produces 1536-dim vectors — remember to update the schema's vector column
// and re-ingest existing documents when switching.
// ============================================================================

// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function embedTexts(texts: string[]): Promise<number[][]> {
//   const res = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: texts,
//   });
//   return res.data.map((d) => d.embedding);
// }

// export const EMBEDDING_DIMENSIONS = 1536;