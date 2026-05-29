import type { AgentId } from "@fms/shared";
import type { AnalysisArtifact } from "@fms/agents";
import type { TokenUsage } from "../types/workflow.js";

export function mergeByAgentId(
  existing: AnalysisArtifact[],
  incoming: AnalysisArtifact[],
): AnalysisArtifact[] {
  const map = new Map<AgentId, AnalysisArtifact>();
  for (const a of existing) {
    map.set(a.agentId, a);
  }
  for (const a of incoming) {
    map.set(a.agentId, a);
  }
  return [...map.values()];
}

export function analysesToRecord(
  analyses: AnalysisArtifact[],
): Record<string, AnalysisArtifact> {
  return Object.fromEntries(analyses.map((a) => [a.agentId, a]));
}

export function addTokenUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    prompt: (a?.prompt ?? 0) + (b?.prompt ?? 0),
    completion: (a?.completion ?? 0) + (b?.completion ?? 0),
  };
}

export function appendErrors(existing: string[], incoming: string[]): string[] {
  return [...existing, ...incoming];
}
