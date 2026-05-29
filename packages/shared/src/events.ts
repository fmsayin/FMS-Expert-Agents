import type { AgentId, SessionPhase } from "./constants.js";

/** SSE event payloads streamed to the web client. */
export type SseEvent =
  | { type: "phase"; phase: SessionPhase; sessionId: string }
  | { type: "analysis_complete"; sessionId: string; agentIds: AgentId[] }
  | { type: "debate_turn"; sessionId: string; agentId: AgentId; turnIndex: number }
  | { type: "challenge_complete"; sessionId: string }
  | { type: "consensus_update"; sessionId: string }
  | { type: "report_complete"; sessionId: string }
  | { type: "error"; sessionId: string; message: string };
