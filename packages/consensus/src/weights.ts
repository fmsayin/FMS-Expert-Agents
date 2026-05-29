import { AGENT_REGISTRY } from "@fms/agents";
import type { AgentId } from "@fms/shared";

/** Agent voting weights from registry definitions. */
export function getAgentWeight(agentId: AgentId): number {
  return AGENT_REGISTRY[agentId].consensusWeight;
}
