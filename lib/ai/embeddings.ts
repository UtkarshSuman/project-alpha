// ============================================================================
// FEATURE: Multi-provider Embeddings with Fast 100% Free Default
// Supports:
// 1. "fast" / default: 100% FREE, instant 384-dimensional offline vectorizer (zero external APIs,
//    zero credit card, zero rate limits, works reliably on Vercel Serverless & local dev).
// 2. "openai": text-embedding-3-small (dimensions: 384) via OPENAI_API_KEY
// 3. "huggingface": all-MiniLM-L6-v2 via HF_TOKEN (only if explicitly set as provider)
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

  // 2. Explicit Hugging Face ONLY when user explicitly asks for it
  if (
    (explicitProvider === "huggingface" || explicitProvider === "hf") &&
    process.env.HF_TOKEN
  ) {
    try {
      const { embedTexts } = await import("./embeddings-huggingface");
      return await embedTexts(texts);
    } catch (hfErr) {
      console.warn(
        "Hugging Face inference error/no credits, falling back to fast offline vectorizer:",
        hfErr
      );
    }
  }

  // 3. Fast offline 384-dimensional vectorizer: 100% free, zero external API calls
  const { embedTexts } = await import("./embeddings-fast");
  return embedTexts(texts);
}