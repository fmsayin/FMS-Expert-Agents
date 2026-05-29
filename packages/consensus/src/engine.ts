import { AGENT_REGISTRY } from "@fms/agents";
import type { AgentId } from "@fms/shared";
import type {
  ConsensusDraft,
  ConsensusEngine,
  ConsensusInput,
  EthicsEvaluation,
  Pillar,
  PhasedAction,
  DissentRecord,
} from "./types.js";

function agentWeights(): Record<AgentId, number> {
  return Object.fromEntries(
    Object.entries(AGENT_REGISTRY).map(([id, def]) => [id, def.consensusWeight]),
  ) as Record<AgentId, number>;
}

/** Deterministic weighted merge stub; Chief LLM narrative merge happens in orchestrator. */
export function createConsensusEngine(): ConsensusEngine {
  const weights = agentWeights();

  return {
    merge(input: ConsensusInput): ConsensusDraft {
      const w = input.weights ?? weights;
      const topRecs = input.analyses
        .flatMap((a) =>
          a.recommendations.map((r) => ({
            text: typeof r === "string" ? r : r.text,
            weight: w[a.agentId] ?? 1,
          })),
        )
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 8);

      const pillars: Pillar[] = input.analyses.slice(0, 5).map((a, i) => ({
        id: `pillar-${i + 1}`,
        title: a.agentId.replace(/_/g, " "),
        description: a.executiveSummary.slice(0, 280),
      }));

      const phasedActions: PhasedAction[] = [
        {
          phase: "immediate",
          actions: topRecs.slice(0, 3).map((r) => r.text),
          timeframe: "0–6 months",
        },
        {
          phase: "medium",
          actions: topRecs.slice(3, 6).map((r) => r.text),
          timeframe: "6–24 months",
        },
      ];

      const dissent: DissentRecord[] = input.challenges
        .filter((c) => c.severity === "high" || c.severity === "blocking")
        .slice(0, 5)
        .map((c) => ({
          agentId: c.challengerAgentId,
          position: `Challenge on ${c.targetClaimId}`,
          rationale: c.content,
        }));

      const avgWeight =
        input.analyses.reduce((s, a) => s + (w[a.agentId] ?? 1), 0) /
        Math.max(input.analyses.length, 1);

      return {
        recommendationSummary: topRecs.map((r) => r.text).join(" "),
        strategicPillars: pillars,
        phasedActions,
        dissent,
        confidenceScore: Math.min(0.95, 0.5 + avgWeight * 0.1),
        ethicsCleared: !input.challenges.some((c) => c.severity === "blocking"),
      };
    },

    evaluateEthics(draft, challenges): EthicsEvaluation {
      const blockingChallenges = challenges.filter(
        (c) => c.severity === "blocking",
      );
      const concerns = blockingChallenges.map((c) => ({
        agentId: c.challengerAgentId,
        severity: c.severity,
        description: c.content,
      }));

      if (!draft.ethicsCleared || blockingChallenges.length > 0) {
        return { blocking: true, concerns };
      }
      return { blocking: false, concerns };
    },
  };
}
