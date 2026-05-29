import { AGENT_REGISTRY } from "@fms/agents";
import type { AgentId } from "@fms/shared";
import type { ThinkTankState } from "../state/think-tank-state.js";

export function buildDebateContext(
  state: ThinkTankState,
  agentId: AgentId,
  round: number,
): string {
  const own = state.analyses.find((a) => a.agentId === agentId);
  const others = state.analyses
    .filter((a) => a.agentId !== agentId)
    .map(
      (a) =>
        `- ${AGENT_REGISTRY[a.agentId].displayName}: ${a.executiveSummary.slice(0, 200)}`,
    )
    .join("\n");

  const lastRoundTurns = state.debateTurns
    .filter((t) => t.round === round - 1)
    .map((t) => `[${t.agentId}] (${t.stance}): ${t.content}`)
    .join("\n");

  const addressed = state.messages
    .filter((m) => m.toAgentId === agentId)
    .map((m) => `[${m.fromAgentId}]: ${m.content}`)
    .join("\n");

  return [
    `Topic: ${state.topic}`,
    `Context: ${JSON.stringify(state.context)}`,
    "",
    "Your analysis:",
    own?.executiveSummary ?? "(none)",
    "",
    "Other experts (executive summaries):",
    others || "(none)",
    "",
    "Previous round:",
    lastRoundTurns || "(first round for this agent)",
    "",
    "Messages to you:",
    addressed || "(none)",
    "",
    `Produce debate round ${round} for agent ${agentId}. Reference other experts by ID.`,
  ].join("\n");
}
