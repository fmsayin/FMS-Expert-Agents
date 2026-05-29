/** Append structured risks to session register (stub). */
export async function riskRegister(
  _sessionId: string,
  _risk: { title: string; severity: string },
): Promise<{ id: string }> {
  return { id: "stub" };
}
