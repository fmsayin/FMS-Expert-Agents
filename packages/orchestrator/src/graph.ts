import { END, START, StateGraph } from "@langchain/langgraph";
import {
  routeAfterCollect,
  routeAfterConsensus,
  routeAfterDebateRound,
  routeAfterHumanReview,
} from "./edges/routing.js";
import { analyzeAgent } from "./nodes/analyze-agent.js";
import { buildConsensus } from "./nodes/build-consensus.js";
import { collectAnalyses } from "./nodes/collect-analyses.js";
import { debateRound } from "./nodes/debate-round.js";
import { fanOutAnalysis, parallelAnalysisNode } from "./nodes/fan-out-analysis.js";
import { finalizeSession } from "./nodes/finalize.js";
import { generateReport } from "./nodes/generate-report.js";
import { humanReviewGate } from "./nodes/human-review-gate.js";
import { initializeSession } from "./nodes/initialize-session.js";
import { riskChallengePass } from "./nodes/risk-challenge.js";
import {
  ThinkTankStateAnnotation,
  type ThinkTankState,
} from "./state/think-tank-state.js";
import type { DebateGraphConfig } from "./types/workflow.js";
import { setGraphConfig } from "./graph/config.js";

export type CompiledDebateGraph = ReturnType<typeof buildWorkflowGraph>;

function buildWorkflowGraph(config: DebateGraphConfig = {}) {
  setGraphConfig(config);

  const workflow = new StateGraph(ThinkTankStateAnnotation)
    .addNode("initializeSession", initializeSession)
    .addNode("parallelAnalysis", parallelAnalysisNode)
    .addNode("analyze_agent", analyzeAgent)
    .addNode("collect_analyses", collectAnalyses)
    .addNode("debate_round", debateRound)
    .addNode("risk_challenge_pass", riskChallengePass)
    .addNode("build_consensus", buildConsensus)
    .addNode("human_review_gate", humanReviewGate)
    .addNode("generate_report", generateReport)
    .addNode("finalize", finalizeSession)
    .addEdge(START, "initializeSession")
    .addEdge("initializeSession", "parallelAnalysis")
    .addConditionalEdges("parallelAnalysis", fanOutAnalysis, ["analyze_agent"])
    .addEdge("analyze_agent", "collect_analyses")
    .addConditionalEdges("collect_analyses", routeAfterCollect, [
      "debate_round",
      "finalize",
    ])
    .addConditionalEdges("debate_round", routeAfterDebateRound, [
      "debate_round",
      "risk_challenge_pass",
    ])
    .addEdge("risk_challenge_pass", "build_consensus")
    .addConditionalEdges("build_consensus", routeAfterConsensus, [
      "human_review_gate",
      "generate_report",
    ])
    .addConditionalEdges("human_review_gate", routeAfterHumanReview, [
      "generate_report",
      "build_consensus",
      "human_review_gate",
    ])
    .addEdge("generate_report", "finalize")
    .addEdge("finalize", END);

  if (config.checkpointer) {
    return workflow.compile({ checkpointer: config.checkpointer as never });
  }

  return workflow.compile();
}

/** Compile the FMS Expert Agents LangGraph debate workflow. */
export function createDebateGraph(config: DebateGraphConfig = {}) {
  return buildWorkflowGraph(config);
}

/** @deprecated Use createDebateGraph */
export const createThinkTankGraph = createDebateGraph;

export type { ThinkTankState };
