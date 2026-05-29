import { describe, expect, it } from "vitest";
import { ALL_AGENT_IDS } from "@fms/shared";
import { createDebateGraph } from "./graph.js";
import { getEnabledAgents, getSpeakingOrder } from "./debate/scheduler.js";
import { initialThinkTankState } from "./state/think-tank-state.js";
import { runDebateWorkflow } from "./runners/workflow.js";

describe("debate graph structure", () => {
  it("compiles without OPENAI_API_KEY", () => {
    const graph = createDebateGraph({ mockLlm: true });
    expect(graph.invoke).toBeTypeOf("function");
  });

  it("references all 13 agent IDs in scheduling", () => {
    expect(ALL_AGENT_IDS).toHaveLength(13);
    const state = initialThinkTankState("test-session", "Test topic", {
      settings: {
        debateRoundsMax: 2,
        agentsEnabled: [...ALL_AGENT_IDS],
        allowPartialAnalyses: true,
      },
    });
    const enabled = getEnabledAgents(state);
    expect(enabled).toHaveLength(13);
    const round1 = getSpeakingOrder({ ...state, debateRoundCurrent: 0 });
    expect(round1.at(-1)).toBe("chief_peace_architect");
  });
});

describe("mock workflow run", () => {
  it(
    "completes end-to-end with MOCK_LLM",
    async () => {
      const result = await runDebateWorkflow(
        {
          sessionId: "dry-run-session",
          topic: "Ceasefire monitoring in a fictional region",
          rounds: 1,
          allowPartialAnalyses: true,
        },
        { mockLlm: true },
      );

      expect(result.phase).toBe("complete");
      expect(result.analyses.length).toBeGreaterThan(0);
      expect(result.report).not.toBeNull();
      expect(result.debateTranscript.length).toBeGreaterThan(0);
    },
    120_000,
  );
});
