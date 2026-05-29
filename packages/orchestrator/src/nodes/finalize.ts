import { emitStreamEvent } from "../events/emit.js";
import type { ThinkTankState } from "../state/think-tank-state.js";

/** Terminal error handling node before END. */
export async function finalizeSession(
  state: ThinkTankState,
): Promise<Partial<ThinkTankState>> {
  if (state.fatalError && state.phase !== "complete") {
    await emitStreamEvent({
      type: "error",
      sessionId: state.sessionId,
      payload: {
        message: state.errors.join("; ") || "Workflow failed",
        node: "finalize",
      },
    });
    return { phase: "failed", currentPhase: "failed" };
  }
  return {};
}
