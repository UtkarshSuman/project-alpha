// ============================================================================
// FEATURE: Fast Deterministic 384-Dimensional Embeddings (100% FREE, Offline)
// Uses n-gram hashing vectorization with sublinear TF scaling and L2 normalization.
// Produces 384-dimensional float vectors matching Supabase's vector(384).
//
// Advantages:
// 1. Zero external API calls, zero cost, zero latency, zero rate limits.
// 2. Zero native C++ dependencies — runs seamlessly in Vercel Serverless & Node.
// 3. Cosine distance (<=>) in pgvector directly measures semantic/n-gram overlap.
// ============================================================================

export const EMBEDDING_DIMENSIONS = 384;

function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function murmur3_32(str: string, seed = 0): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    let k = str.charCodeAt(i);
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);

    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = Math.imul(h, 5) + 0xe6546b64;
  }
  h ^= str.length;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export function generateTextVector(text: string, dimensions = 384): number[] {
  const vec = new Float64Array(dimensions);
  if (!text || !text.trim()) {
    vec[0] = 1;
    return Array.from(vec);
  }

  // Tokenize words + lowercase
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  if (words.length === 0) {
    vec[0] = 1;
    return Array.from(vec);
  }

  // Hash unigrams
  for (const word of words) {
    const idx = fnv1a32(word) % dimensions;
    const sign = (murmur3_32(word) & 1) === 0 ? 1 : -1;
    vec[idx] += sign * 1.0;
  }

  // Hash bigrams for contextual phrase overlap
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]}_${words[i + 1]}`;
    const idx = fnv1a32(bigram) % dimensions;
    const sign = (murmur3_32(bigram) & 1) === 0 ? 1 : -1;
    vec[idx] += sign * 1.5;
  }

  // Sublinear scaling: sign(x) * (1 + ln(|x|))
  for (let i = 0; i < dimensions; i++) {
    if (vec[i] !== 0) {
      const sign = vec[i] > 0 ? 1 : -1;
      vec[i] = sign * (1 + Math.log(Math.abs(vec[i])));
    }
  }

  // L2 unit normalization
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] = Number((vec[i] / norm).toFixed(6));
    }
  } else {
    vec[0] = 1;
  }

  return Array.from(vec);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  return texts.map((t) => generateTextVector(t, EMBEDDING_DIMENSIONS));
}
