import { scoreClaims, MANDATORY_CHALLENGE_AGENTS } from "../debate/scheduler.js";
import { emitStreamEvent } from "../events/emit.js";
import { invokeAgentChallenge } from "../runners/invoke-agent.js";
import type { ThinkTankState } from "../state/think-tank-state.js";
import { getGraphConfig } from "../graph/config.js";

/** Dedicated assumption & risk challenge pass. */
export async function riskChallengePass(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  const { mockLlm } = getGraphConfig();
  const topClaims = [...scoreClaims(state.debateTurns).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  const targets =
    topClaims.length > 0
      ? topClaims
      : state.debateTurns.flatMap((t) => t.newClaims.map((c) => c.id)).slice(0, 5);

  const records = [];
  let targetIndex = 0;

  for (const agentId of MANDATORY_CHALLENGE_AGENTS) {
    const targetClaimId = targets[targetIndex % targets.length] ?? "claim-global-1";
    targetIndex++;
    try {
      const record = await invokeAgentChallenge(
        agentId,
        state,
        targetClaimId,
        mockLlm,
      );
      records.push(record);
      await emitStreamEvent({
        type: "challenge_finding",
        sessionId: state.sessionId,
        payload: { record },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      records.push({
        challengerAgentId: agentId,
        targetClaimId,
        challengeType: "risk",
        content: `[challenge error] ${msg}`,
        severity: "low",
      });
    }
  }

  await emitStreamEvent({
    type: "phase_change",
    sessionId: state.sessionId,
    payload: { phase: "challenge" },
  });

  return {
    challengeRecords: records,
    phase: "challenge",
    currentPhase: "challenge",
  };
}
