const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

/**
 * Split text into ~500–800 token chunks (~2000 chars) with 200-char overlap.
 */
export function chunkText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + CHUNK_SIZE, normalized.length);

    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const breakAt = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf("\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf(" "),
      );
      if (breakAt > CHUNK_SIZE * 0.4) {
        end = start + breakAt + (slice[breakAt] === "\n" ? 1 : 2);
      }
    }

    const piece = normalized.slice(start, end).trim();
    if (piece) chunks.push(piece);

    if (end >= normalized.length) break;
    start = Math.max(0, end - CHUNK_OVERLAP);
    if (start >= normalized.length) break;
  }

  return chunks;
}
