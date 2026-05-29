import { interrupt } from "@langchain/langgraph";
import { emitStreamEvent } from "../events/emit.js";
import type { ThinkTankState } from "../state/think-tank-state.js";

/** Pause graph when ethics blocking requires human review. */
export async function humanReviewGate(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  if (!state.ethicsBlocking) {
    return {};
  }

  const resumeValue = interrupt({
    type: "human_review",
    sessionId: state.sessionId,
    concerns: state.ethicsConcerns,
    consensusDraft: state.consensusDraft,
  }) as { humanReviewStatus?: "approved" | "rejected" } | undefined;

  const status =
    resumeValue?.humanReviewStatus ?? state.humanReviewStatus ?? "pending";

  if (status === "pending") {
    return { humanReviewStatus: "pending" };
  }

  if (status === "approved") {
    await emitStreamEvent({
      type: "phase_change",
      sessionId: state.sessionId,
      payload: { phase: "consensus", humanReview: "approved" },
    });
    return {
      humanReviewStatus: "approved",
      ethicsBlocking: false,
      consensusFinal: state.consensusDraft,
    };
  }

  await emitStreamEvent({
    type: "phase_change",
    sessionId: state.sessionId,
    payload: { phase: "consensus", humanReview: "rejected" },
  });

  return {
    humanReviewStatus: "rejected",
    consensusDraft: null,
  };
}
