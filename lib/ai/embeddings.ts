// ============================================================================
// FEATURE: Embeddings provider switch & auto-detection
// Supports:
// 1. "openai": text-embedding-3-small (dimensions: 384) via OPENAI_API_KEY
// 2. "huggingface": all-MiniLM-L6-v2 (dimensions: 384) via free HF_TOKEN / HUGGINGFACE_API_KEY
// 3. "local": local all-MiniLM-L6-v2 via @xenova/transformers (for local Node.js dev)
// ============================================================================

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const explicitProvider = process.env.EMBEDDINGS_PROVIDER?.toLowerCase();

  // 1. If explicitly OpenAI or if OPENAI_API_KEY is available and provider not set to local/hf
  if (
    explicitProvider === "openai" ||
    (explicitProvider !== "local" && explicitProvider !== "huggingface" && process.env.OPENAI_API_KEY)
  ) {
    const { embedTexts } = await import("./embeddings-openai");
    return embedTexts(texts);
  }

  // 2. If explicitly Hugging Face or if HF_TOKEN is available
  if (
    explicitProvider === "huggingface" ||
    explicitProvider === "hf" ||
    (explicitProvider !== "local" && (process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY))
  ) {
    const { embedTexts } = await import("./embeddings-huggingface");
    return embedTexts(texts);
  }

  // 3. Local fallback (works for local development, caught gracefully on serverless)
  try {
    const { embedTexts } = await import("./embeddings-local");
    return await embedTexts(texts);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("libonnxruntime") || errMsg.includes("cannot open shared object file")) {
      throw new Error(
        "Local ONNX runtime cannot run in Vercel serverless (missing libonnxruntime.so). " +
        "To enable document ingestion on deployment, add either OPENAI_API_KEY or a free HF_TOKEN " +
        "(create free token at https://huggingface.co/settings/tokens) in your Vercel project environment variables."
      );
    }
    throw err;
  }
}