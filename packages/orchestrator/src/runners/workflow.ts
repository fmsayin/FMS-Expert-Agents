import { ALL_AGENT_IDS } from "@fms/shared";
import { createDebateGraph } from "../graph.js";
import { setWorkflowEventHandler } from "../events/emit.js";
import { initialThinkTankState } from "../state/think-tank-state.js";
import type {
  DebateGraphConfig,
  DebateWorkflowInput,
  DebateWorkflowResult,
} from "../types/workflow.js";

export async function runDebateWorkflow(
  input: DebateWorkflowInput,
  config: DebateGraphConfig = {},
): Promise<DebateWorkflowResult> {
  if (config.onEvent) {
    setWorkflowEventHandler(config.onEvent);
  }

  const agentsEnabled = input.agentsEnabled ?? [...ALL_AGENT_IDS];
  const rounds = input.rounds ?? 2;

  const initial = initialThinkTankState(input.sessionId, input.topic, {
    userId: input.userId ?? "",
    context: input.context ?? {},
    debateRoundsMax: rounds,
    settings: {
      debateRoundsMax: rounds,
      agentsEnabled,
      allowPartialAnalyses: input.allowPartialAnalyses ?? false,
    },
  });

  const graph = createDebateGraph({
    ...config,
    mockLlm: config.mockLlm ?? !process.env.OPENAI_API_KEY,
  });

  const finalState = await graph.invoke(initial, {
    configurable: { thread_id: input.sessionId },
  });

  return {
    sessionId: finalState.sessionId,
    phase: finalState.phase,
    analyses: finalState.analyses,
    independentAnalyses: finalState.independentAnalyses,
    debateTranscript: finalState.debateTranscript,
    challengeRecords: finalState.challengeRecords,
    consensusDraft: finalState.consensusDraft,
    report: finalState.report,
    errors: finalState.errors,
    ethicsBlocking: finalState.ethicsBlocking,
    humanReviewStatus: finalState.humanReviewStatus,
  };
}

/** Architecture doc alias. */
export const runThinkTankGraph = runDebateWorkflow;
