import type { StreamEvent, WorkflowEventCallback } from "../types/workflow.js";

let globalOnEvent: WorkflowEventCallback | undefined;

export function setWorkflowEventHandler(handler?: WorkflowEventCallback): void {
  globalOnEvent = handler;
}

export async function emitStreamEvent(
  event: Omit<StreamEvent, "timestamp"> & { timestamp?: string },
): Promise<void> {
  const full: StreamEvent = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };
  await globalOnEvent?.(full);
}
