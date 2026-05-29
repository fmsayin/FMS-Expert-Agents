import type { AgentId, SessionPhase } from "@fms/shared";
import type { AnalysisArtifact, ChallengeRecord, DebateTurn } from "@fms/agents";
import type { ConsensusDraft, EthicsConcern } from "@fms/consensus";
import type { StrategicPeaceReport } from "@fms/report";

export interface WorkflowSettings {
  debateRoundsMax: number;
  agentsEnabled: AgentId[];
  allowPartialAnalyses: boolean;
  modelOverrides?: Record<string, string>;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
}

export interface A2AMessage {
  id: string;
  fromAgentId: AgentId;
  toAgentId?: AgentId;
  round: number;
  content: string;
}

export type HumanReviewStatus = "pending" | "approved" | "rejected" | null;

export type StreamEventType =
  | "phase_change"
  | "analysis_progress"
  | "debate_turn"
  | "challenge_finding"
  | "consensus_update"
  | "report_section"
  | "complete"
  | "error";

export interface StreamEvent {
  type: StreamEventType;
  sessionId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export type WorkflowEventCallback = (event: StreamEvent) => void | Promise<void>;

export interface DebateWorkflowInput {
  sessionId: string;
  topic: string;
  userId?: string;
  context?: Record<string, unknown>;
  rounds?: number;
  agentsEnabled?: AgentId[];
  allowPartialAnalyses?: boolean;
}

export interface DebateWorkflowResult {
  sessionId: string;
  phase: SessionPhase;
  analyses: AnalysisArtifact[];
  independentAnalyses: Record<string, AnalysisArtifact>;
  debateTranscript: DebateTurn[];
  challengeRecords: ChallengeRecord[];
  consensusDraft: ConsensusDraft | null;
  report: StrategicPeaceReport | null;
  errors: string[];
  ethicsBlocking: boolean;
  humanReviewStatus: HumanReviewStatus;
}

export interface DebateGraphConfig {
  onEvent?: WorkflowEventCallback;
  mockLlm?: boolean;
  checkpointer?: unknown;
}
