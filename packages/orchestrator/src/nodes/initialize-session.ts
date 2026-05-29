import { ALL_AGENT_IDS } from "@fms/shared";
import { emitStreamEvent } from "../events/emit.js";
import type { ThinkTankState } from "../state/think-tank-state.js";

/** Validate session config and transition to analysis phase (intake). */
export async function initializeSession(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  if (!state.sessionId || !state.topic?.trim()) {
    return {
      errors: ["sessionId and topic are required"],
      fatalError: true,
      phase: "failed",
      currentPhase: "failed",
    };
  }

  const settings = state.settings ?? {
    debateRoundsMax: 2,
    agentsEnabled: [],
    allowPartialAnalyses: false,
  };

  const agentsEnabled =
    settings.agentsEnabled.length > 0
      ? settings.agentsEnabled
      : [...ALL_AGENT_IDS];

  const debateRoundsMax = state.debateRoundsMax || settings.debateRoundsMax;

  await emitStreamEvent({
    type: "phase_change",
    sessionId: state.sessionId,
    payload: { phase: "analysis" },
  });

  return {
    phase: "analysis",
    currentPhase: "analysis",
    settings: {
      ...settings,
      agentsEnabled,
      debateRoundsMax,
    },
    debateRoundsMax,
    debateRoundCurrent: 0,
    streamMetadata: {
      ...state.streamMetadata,
      startedAt: new Date().toISOString(),
    },
  };
}
