import { AGENT_REGISTRY } from "@fms/agents";
import { createConsensusEngine } from "@fms/consensus";
import type { AgentId } from "@fms/shared";
import { emitStreamEvent } from "../events/emit.js";
import type { ThinkTankState } from "../state/think-tank-state.js";

const consensusEngine = createConsensusEngine();

/** Weighted merge via @fms/consensus + ethics evaluation. */
export async function buildConsensus(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  const weights = Object.fromEntries(
    Object.entries(AGENT_REGISTRY).map(([id, def]) => [id, def.consensusWeight]),
  ) as Record<AgentId, number>;

  const draft = consensusEngine.merge({
    analyses: state.analyses,
    turns: state.debateTurns,
    challenges: state.challengeRecords,
    weights,
  });

  const ethics = consensusEngine.evaluateEthics(draft, state.challengeRecords);
  const ethicsBlocking =
    ethics.blocking ||
    state.challengeRecords.some((c) => c.severity === "blocking");

  await emitStreamEvent({
    type: "consensus_update",
    sessionId: state.sessionId,
    payload: { draft, ethicsBlocking },
  });

  await emitStreamEvent({
    type: "phase_change",
    sessionId: state.sessionId,
    payload: { phase: "consensus" },
  });

  return {
    consensusDraft: draft,
    ethicsBlocking,
    ethicsConcerns: ethics.concerns,
    phase: "consensus",
    currentPhase: "consensus",
    humanReviewStatus: ethicsBlocking ? "pending" : state.humanReviewStatus,
  };
}
