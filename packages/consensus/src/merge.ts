/** Weighted consensus merge (stub). */
export interface ConsensusDraft {
  sessionId: string;
  strategicLines: string[];
  tradeoffs: string[];
}

export function mergeConsensus(_inputs: unknown[]): ConsensusDraft {
  return {
    sessionId: "stub",
    strategicLines: [],
    tradeoffs: [],
  };
}
