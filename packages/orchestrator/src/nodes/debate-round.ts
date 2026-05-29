import { buildDebateContext } from "../debate/context-builder.js";
import { getSpeakingOrder } from "../debate/scheduler.js";
import { emitStreamEvent } from "../events/emit.js";
import { invokeAgentDebate } from "../runners/invoke-agent.js";
import type { ThinkTankState } from "../state/think-tank-state.js";
import { getGraphConfig } from "../graph/config.js";

/** Execute one full debate round across scheduled agents. */
export async function debateRound(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  const round = state.debateRoundCurrent + 1;
  const order = getSpeakingOrder({ ...state, debateRoundCurrent: round - 1 });
  const { mockLlm } = getGraphConfig();

  const newTurns = [];
  const newMessages = [];

  for (const agentId of order) {
    try {
      const contextPrompt = buildDebateContext(
        { ...state, debateTurns: [...state.debateTurns, ...newTurns] },
        agentId,
        round,
      );
      const turn = await invokeAgentDebate(
        agentId,
        state,
        round,
        contextPrompt,
        mockLlm,
      );
      newTurns.push(turn);
      newMessages.push({
        id: `debate-${round}-${agentId}`,
        fromAgentId: agentId,
        round,
        content: turn.content,
      });

      await emitStreamEvent({
        type: "debate_turn",
        sessionId: state.sessionId,
        payload: { turn },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      newTurns.push({
        agentId,
        round,
        content: `[skipped after error] ${msg}`,
        claimsAddressed: [],
        stance: "clarify" as const,
        newClaims: [],
      });
    }
  }

  return {
    debateTurns: newTurns,
    debateTranscript: newTurns,
    messages: newMessages,
    debateRoundCurrent: round,
    phase: "debate",
    currentPhase: "debate",
  };
}
