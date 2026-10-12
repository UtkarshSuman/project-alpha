// ============================================================================
// FEATURE: Embeddings — Hugging Face Serverless Inference
// Uses sentence-transformers/all-MiniLM-L6-v2 via Hugging Face Router API.
// 100% free with a free Hugging Face User Access Token (HF_TOKEN or HUGGINGFACE_API_KEY).
// Produces 384-dim vectors matching pgvector vector(384).
// Works seamlessly in Vercel/AWS Lambda serverless with zero native dependencies.
// ============================================================================

const HF_ROUTER_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    throw new Error(
      "Missing HF_TOKEN or HUGGINGFACE_API_KEY in environment variables. Get a free token at https://huggingface.co/settings/tokens"
    );
  }

  const res = await fetch(HF_ROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: texts }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Hugging Face inference error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected Hugging Face response format: ${JSON.stringify(data)}`);
  }

  // If a single text was passed, HF might return number[] directly
  if (texts.length === 1 && typeof data[0] === "number") {
    return [data as unknown as number[]];
  }

  return data as number[][];
}

export const EMBEDDING_DIMENSIONS = 384;
