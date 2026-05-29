import type { AgentId } from "@fms/shared";
import { ALL_AGENT_IDS } from "@fms/shared";
import type { DebateTurn } from "@fms/agents";
import type { ThinkTankState } from "../state/think-tank-state.js";

const DOMAIN_AGENTS_SORTED: AgentId[] = [...ALL_AGENT_IDS]
  .filter((id) => id !== "chief_peace_architect")
  .sort();

const PAIRED_TENSION_ORDER: AgentId[] = [
  "strategic_security",
  "peace_conflict",
  "diplomacy_ir",
  "economic_dev",
  "humanitarian",
  "diplomacy_ir",
  "ai_peace",
  "media_comms",
  "ethics_rights",
  "chief_peace_architect",
  "environmental_security",
  "economic_dev",
];

export function getEnabledAgents(state: ThinkTankState): AgentId[] {
  const enabled = state.settings?.agentsEnabled ?? [];
  if (enabled.length > 0) {
    return enabled;
  }
  return [...ALL_AGENT_IDS];
}

/** Round 1: domain experts alphabetically, then Chief synthesizes. */
export function getSpeakingOrder(state: ThinkTankState): AgentId[] {
  const round = state.debateRoundCurrent + 1;
  const enabled = new Set(getEnabledAgents(state));

  if (round === 1) {
    const domain = DOMAIN_AGENTS_SORTED.filter((id) => enabled.has(id));
    if (enabled.has("chief_peace_architect")) {
      return [...domain, "chief_peace_architect"];
    }
    return domain;
  }

  if (round === 2) {
    const seen = new Set<AgentId>();
    const order: AgentId[] = [];
    for (const id of PAIRED_TENSION_ORDER) {
      if (enabled.has(id) && !seen.has(id)) {
        order.push(id);
        seen.add(id);
      }
    }
    return order;
  }

  return selectTopContestedRespondents(state, enabled);
}

function selectTopContestedRespondents(
  state: ThinkTankState,
  enabled: Set<AgentId>,
): AgentId[] {
  const scores = scoreClaims(state.debateTurns);
  const topClaimIds = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  const respondents = new Set<AgentId>();
  for (const turn of state.debateTurns) {
    if (!enabled.has(turn.agentId)) continue;
    const addressed = turn.claimsAddressed.some((c) => topClaimIds.includes(c));
    if (addressed || turn.stance === "oppose") {
      respondents.add(turn.agentId);
    }
  }

  if (enabled.has("chief_peace_architect")) {
    respondents.add("chief_peace_architect");
  }

  return [...respondents].slice(0, 8);
}

export function scoreClaims(turns: DebateTurn[]): Map<string, number> {
  const scores = new Map<string, number>();

  for (const turn of turns) {
    for (const claimId of turn.claimsAddressed) {
      const base = scores.get(claimId) ?? 0;
      const delta =
        turn.stance === "oppose" ? 2 : turn.stance === "support" ? 1 : 1;
      scores.set(claimId, base + delta);
    }
    for (const claim of turn.newClaims) {
      const base = scores.get(claim.id) ?? 0;
      const ethicsFlag = turn.agentId === "ethics_rights" ? 3 : 0;
      scores.set(claim.id, base + ethicsFlag);
    }
  }

  return scores;
}

export const MANDATORY_CHALLENGE_AGENTS: AgentId[] = [
  "ethics_rights",
  "strategic_security",
  "humanitarian",
  "chief_peace_architect",
];
