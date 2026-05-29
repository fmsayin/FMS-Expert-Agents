import type { ThinkTankState } from "../state/think-tank-state.js";

export function routeAfterCollect(
  state: ThinkTankState,
): "debate_round" | "finalize" {
  return state.fatalError ? "finalize" : "debate_round";
}

export function routeAfterDebateRound(
  state: ThinkTankState,
): "debate_round" | "risk_challenge_pass" {
  if (state.debateRoundCurrent < state.debateRoundsMax) {
    return "debate_round";
  }
  return "risk_challenge_pass";
}

export function routeAfterConsensus(
  state: ThinkTankState,
): "human_review_gate" | "generate_report" {
  if (state.ethicsBlocking && state.humanReviewStatus !== "approved") {
    return "human_review_gate";
  }
  return "generate_report";
}

export function routeAfterHumanReview(
  state: ThinkTankState,
): "generate_report" | "build_consensus" | "human_review_gate" {
  if (state.humanReviewStatus === "approved") {
    return "generate_report";
  }
  if (state.humanReviewStatus === "rejected") {
    return "build_consensus";
  }
  return "human_review_gate";
}
