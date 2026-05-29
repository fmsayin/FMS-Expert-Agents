import type { AgentId } from "@fms/shared";
import type { AnalysisArtifact } from "@fms/agents";
import type { ChallengeRecord, DebateTurn } from "@fms/agents";

export interface Pillar {
  id: string;
  title: string;
  description: string;
}

export interface PhasedAction {
  phase: string;
  actions: string[];
  timeframe?: string;
}

export interface DissentRecord {
  agentId: AgentId;
  position: string;
  rationale: string;
}

export interface ConsensusDraft {
  recommendationSummary: string;
  strategicPillars: Pillar[];
  phasedActions: PhasedAction[];
  dissent: DissentRecord[];
  confidenceScore: number;
  ethicsCleared: boolean;
}

export interface EthicsConcern {
  agentId: AgentId;
  severity: "low" | "medium" | "high" | "blocking";
  description: string;
}

export interface EthicsEvaluation {
  blocking: boolean;
  concerns: EthicsConcern[];
}

export interface ConsensusInput {
  analyses: AnalysisArtifact[];
  turns: DebateTurn[];
  challenges: ChallengeRecord[];
  weights: Record<AgentId, number>;
}

export interface ConsensusEngine {
  merge(input: ConsensusInput): ConsensusDraft;
  evaluateEthics(
    draft: ConsensusDraft,
    challenges: ChallengeRecord[],
  ): EthicsEvaluation;
}
