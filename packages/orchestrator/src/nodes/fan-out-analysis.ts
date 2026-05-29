import { Send } from "@langchain/langgraph";
import { getEnabledAgents } from "../debate/scheduler.js";
import type { ThinkTankState } from "../state/think-tank-state.js";

/** Pass-through before Send fan-out. */
export async function parallelAnalysisNode(
  _state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  return {};
}

/** Fields required by analyze_agent in parallel Send branches. */
function analysisBranchState(
  state: ThinkTankState,
  agentId: ThinkTankState["currentAgentId"],
): Partial<ThinkTankState> {
  return {
    sessionId: state.sessionId,
    userId: state.userId,
    topic: state.topic,
    context: state.context,
    settings: state.settings,
    currentAgentId: agentId,
  };
}

/** Fan-out parallel analysis via LangGraph Send API. */
export function fanOutAnalysis(
  state: ThinkTankState,
): Send<"analyze_agent", Partial<ThinkTankState>>[] {
  const agents = getEnabledAgents(state);
  return agents.map(
    (agentId) => new Send("analyze_agent", analysisBranchState(state, agentId)),
  );
}
