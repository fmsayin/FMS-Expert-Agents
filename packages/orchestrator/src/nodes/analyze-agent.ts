import { emitStreamEvent } from "../events/emit.js";
import { invokeAgentAnalysis } from "../runners/invoke-agent.js";
import type { ThinkTankState } from "../state/think-tank-state.js";
import { getGraphConfig } from "../graph/config.js";

const MAX_RETRIES = 2;

/** Parallel branch: run one expert's independent analysis. */
export async function analyzeAgent(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  const agentId = state.currentAgentId;
  if (!agentId) {
    return { errors: ["analyze_agent invoked without currentAgentId"] };
  }

  const { mockLlm } = getGraphConfig();
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const artifact = await invokeAgentAnalysis(agentId, state, mockLlm);
      const analysesCompleted = 1;
      const total = state.settings?.agentsEnabled?.length || 13;

      await emitStreamEvent({
        type: "analysis_progress",
        sessionId: state.sessionId,
        payload: {
          agentId,
          progress: `${state.analysesCompleted + analysesCompleted}/${total}`,
        },
      });

      const independentAnalyses = {
        [agentId]: artifact,
      };

      return {
        analyses: [artifact],
        independentAnalyses,
        analysesCompleted,
        tokenUsage: artifact.usage ?? { prompt: 0, completion: 0 },
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      }
    }
  }

  return {
    errors: [`Analysis failed for ${agentId} after retries: ${lastError}`],
  };
}
