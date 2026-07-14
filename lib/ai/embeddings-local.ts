// ============================================================================
// FEATURE: Embeddings — FREE TIER implementation, runs entirely locally.
// Uses Xenova/all-MiniLM-L6-v2 via Transformers.js — no API key, no cost,
// no card. First call downloads the model (~90MB) from Hugging Face and
// caches it locally; subsequent calls are instant. Produces 384-dim vectors.
// ============================================================================

import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";

let extractor: FeatureExtractionPipeline | null = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = await getExtractor();
  const results: number[][] = [];

  // Process one at a time — Transformers.js batches internally but keeping
  // this simple avoids memory spikes on large document uploads during dev.
  for (const text of texts) {
    const output = await model(text, { pooling: "mean", normalize: true });
    results.push(Array.from(output.data as Float32Array));
  }

  return results;
}

export const EMBEDDING_DIMENSIONS = 384;