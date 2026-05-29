import { Annotation } from "@langchain/langgraph";
import type { AgentId, SessionPhase } from "@fms/shared";
import type { AnalysisArtifact, ChallengeRecord, DebateTurn } from "@fms/agents";
import type { ConsensusDraft, EthicsConcern } from "@fms/consensus";
import type { StrategicPeaceReport } from "@fms/report";
import {
  addTokenUsage,
  analysesToRecord,
  appendErrors,
  mergeByAgentId,
} from "./reducers.js";
import type {
  A2AMessage,
  HumanReviewStatus,
  TokenUsage,
  WorkflowSettings,
} from "../types/workflow.js";

export const ThinkTankStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>,
  userId: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => "",
  }),
  topic: Annotation<string>,
  context: Annotation<Record<string, unknown>>({
    reducer: (_a, b) => b,
    default: () => ({}),
  }),
  settings: Annotation<WorkflowSettings>({
    reducer: (_a, b) => b,
    default: () => ({
      debateRoundsMax: 2,
      agentsEnabled: [],
      allowPartialAnalyses: false,
    }),
  }),

  phase: Annotation<SessionPhase>({
    reducer: (_a, b) => b,
    default: () => "queued",
  }),
  currentPhase: Annotation<SessionPhase>({
    reducer: (_a, b) => b,
    default: () => "queued",
  }),

  debateRoundsMax: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 2,
  }),
  debateRoundCurrent: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 0,
  }),
  modelOverrides: Annotation<Record<string, string>>({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),

  errors: Annotation<string[]>({
    reducer: appendErrors,
    default: () => [],
  }),

  analyses: Annotation<AnalysisArtifact[]>({
    reducer: mergeByAgentId,
    default: () => [],
  }),
  independentAnalyses: Annotation<Record<string, AnalysisArtifact>>({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),
  analysesCompleted: Annotation<number>({
    reducer: (a, b) => a + b,
    default: () => 0,
  }),

  currentAgentId: Annotation<AgentId | null>({
    reducer: (_a, b) => b,
    default: () => null,
  }),

  messages: Annotation<A2AMessage[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),

  debateTurns: Annotation<DebateTurn[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),
  debateTranscript: Annotation<DebateTurn[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),

  challengeRecords: Annotation<ChallengeRecord[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),

  consensusDraft: Annotation<ConsensusDraft | null>({
    reducer: (_a, b) => b,
    default: () => null,
  }),
  consensusFinal: Annotation<ConsensusDraft | null>({
    reducer: (_a, b) => b,
    default: () => null,
  }),

  ethicsBlocking: Annotation<boolean>({
    reducer: (_a, b) => b,
    default: () => false,
  }),
  ethicsConcerns: Annotation<EthicsConcern[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),

  report: Annotation<StrategicPeaceReport | null>({
    reducer: (_a, b) => b,
    default: () => null,
  }),
  reportSections: Annotation<StrategicPeaceReport["sections"]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),

  tokenUsage: Annotation<TokenUsage>({
    reducer: addTokenUsage,
    default: () => ({ prompt: 0, completion: 0 }),
  }),

  humanReviewStatus: Annotation<HumanReviewStatus>({
    reducer: (_a, b) => b,
    default: () => null,
  }),

  streamMetadata: Annotation<Record<string, unknown>>({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),

  fatalError: Annotation<boolean>({
    reducer: (_a, b) => b,
    default: () => false,
  }),
});

export type ThinkTankState = typeof ThinkTankStateAnnotation.State;

export function initialThinkTankState(
  sessionId: string,
  topic: string,
  overrides: Partial<ThinkTankState> = {},
): ThinkTankState {
  return {
    sessionId,
    userId: "",
    topic,
    context: {},
    settings: {
      debateRoundsMax: 2,
      agentsEnabled: [],
      allowPartialAnalyses: false,
    },
    phase: "queued",
    currentPhase: "queued",
    debateRoundsMax: 2,
    debateRoundCurrent: 0,
    modelOverrides: {},
    errors: [],
    analyses: [],
    independentAnalyses: {},
    analysesCompleted: 0,
    currentAgentId: null,
    messages: [],
    debateTurns: [],
    debateTranscript: [],
    challengeRecords: [],
    consensusDraft: null,
    consensusFinal: null,
    ethicsBlocking: false,
    ethicsConcerns: [],
    report: null,
    reportSections: [],
    tokenUsage: { prompt: 0, completion: 0 },
    humanReviewStatus: null,
    streamMetadata: {},
    fatalError: false,
    ...overrides,
  };
}

export function syncIndependentAnalyses(
  analyses: AnalysisArtifact[],
): Record<string, AnalysisArtifact> {
  return analysesToRecord(analyses);
}
