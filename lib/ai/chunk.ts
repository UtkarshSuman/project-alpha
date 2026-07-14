// ============================================================================
// FEATURE: Text chunking for RAG
// Splits document text into overlapping windows so retrieval doesn't cut
// sentences/ideas in half at chunk boundaries. ~1000 chars ≈ 200-250 tokens,
// a reasonable default chunk size for retrieval quality vs. context cost.
// ============================================================================

export function chunkText(text: string, chunkSize = 1000, overlap = 150): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    chunks.push(cleaned.slice(start, end));
    if (end === cleaned.length) break;
    start = end - overlap;
  }

  return chunks.filter((c) => c.trim().length > 0);
}