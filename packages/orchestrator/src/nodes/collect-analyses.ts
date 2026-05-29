import { emitStreamEvent } from "../events/emit.js";
import { syncIndependentAnalyses } from "../state/think-tank-state.js";
import type { ThinkTankState } from "../state/think-tank-state.js";
import { getEnabledAgents } from "../debate/scheduler.js";

const MIN_ANALYSES_DEFAULT = 10;

/** Verify analyses complete and seed A2A messages for debate. */
export async function collectAnalyses(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  const expected = getEnabledAgents(state).length;
  const minRequired = state.settings.allowPartialAnalyses
    ? Math.min(3, expected)
    : MIN_ANALYSES_DEFAULT;

  const independentAnalyses = syncIndependentAnalyses(state.analyses);

  if (state.analyses.length < minRequired) {
    await emitStreamEvent({
      type: "error",
      sessionId: state.sessionId,
      payload: {
        message: `Insufficient analyses: ${state.analyses.length}/${minRequired}`,
        node: "collect_analyses",
      },
    });
    return {
      independentAnalyses,
      fatalError: true,
      phase: "failed",
      currentPhase: "failed",
      errors: [
        `Only ${state.analyses.length} analyses completed; need at least ${minRequired}`,
      ],
    };
  }

  const seedMessages = state.analyses.map((a) => ({
    id: `seed-${a.agentId}`,
    fromAgentId: a.agentId,
    round: 0,
    content: a.executiveSummary,
  }));

  await emitStreamEvent({
    type: "phase_change",
    sessionId: state.sessionId,
    payload: { phase: "debate" },
  });

  return {
    independentAnalyses,
    phase: "debate",
    currentPhase: "debate",
    messages: seedMessages,
    debateRoundCurrent: 0,
  };
}
