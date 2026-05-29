/** Persist URLs/snippets to session (stub). */
export async function citationStore(
  _sessionId: string,
  _citation: { url: string; snippet: string },
): Promise<{ id: string }> {
  return { id: "stub" };
}
