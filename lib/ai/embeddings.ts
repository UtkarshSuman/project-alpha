// ============================================================================
// FEATURE: Multi-provider Embeddings with Instant Free Serverless Fallback
// Supports:
// 1. "openai": text-embedding-3-small (dimensions: 384) via OPENAI_API_KEY
// 2. "huggingface": all-MiniLM-L6-v2 via HF_TOKEN (if user has active HF inference credits)
// 3. "fast" / default: 100% FREE, instant 384-dimensional offline vectorizer (zero API keys,
//    zero credit card, zero rate limits, works reliably on Vercel Serverless & local dev).
// ============================================================================

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const explicitProvider = process.env.EMBEDDINGS_PROVIDER?.toLowerCase();

  // 1. Explicit or auto-detected OpenAI (paid tier)
  if (
    explicitProvider === "openai" ||
    (!explicitProvider && process.env.OPENAI_API_KEY)
  ) {
    try {
      const { embedTexts } = await import("./embeddings-openai");
      return await embedTexts(texts);
    } catch (openaiErr) {
      console.warn("OpenAI embeddings failed, falling back to fast vectorizer:", openaiErr);
    }
  }

  // 2. Explicit or auto-detected Hugging Face (if user configured HF_TOKEN)
  if (
    (explicitProvider === "huggingface" || explicitProvider === "hf" || process.env.HF_TOKEN) &&
    process.env.HF_TOKEN
  ) {
    try {
      const { embedTexts } = await import("./embeddings-huggingface");
      return await embedTexts(texts);
    } catch (hfErr) {
      // If Hugging Face returns 402 (no credits) or rate limit, smoothly fallback
      console.warn(
        "Hugging Face inference error/no credits, seamlessly falling back to fast offline vectorizer:",
        hfErr
      );
    }
  }

  // 3. Fast offline 384-dimensional vectorizer: 100% free, runs instantly anywhere
  const { embedTexts } = await import("./embeddings-fast");
  return embedTexts(texts);
}