// ============================================================================
// FEATURE: Embeddings provider switch
// Change EMBEDDINGS_PROVIDER in .env from "local" to "openai" once you have
// a card + API key. Every route imports from THIS file, never the provider
// files directly, so the switch is one env var + one migration step.
// ============================================================================

const provider = process.env.EMBEDDINGS_PROVIDER || "local";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (provider === "openai") {
    const { embedTexts } = await import("./embeddings-openai");
    return embedTexts(texts);
  }
  const { embedTexts } = await import("./embeddings-local");
  return embedTexts(texts);
}