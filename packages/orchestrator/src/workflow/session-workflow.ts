import { createThinkTankGraph } from "../graph/index.js";
import {
  initialThinkTankState,
  type ThinkTankState,
} from "../state/think-tank-state.js";

/** Workflow stream event (persisted to stream_events + SSE). */
export interface WorkflowStreamEvent {
  id: number;
  eventType: string;
  payload: Record<string, unknown>;
}

export type WorkflowEventCallback = (
  event: WorkflowStreamEvent,
) => void | Promise<void>;

interface ActiveRun {
  sessionId: string;
  runId: string;
  status: "running" | "paused" | "completed" | "failed";
  phase: string;
  startedAt: Date;
}

const activeRuns = new Map<string, ActiveRun>();
const subscribers = new Map<string, Set<WorkflowEventCallback>>();
let eventIdCounter = 1;

function nextEventId(): number {
  return eventIdCounter++;
}

function getSubscribers(sessionId: string): Set<WorkflowEventCallback> {
  let set = subscribers.get(sessionId);
  if (!set) {
    set = new Set();
    subscribers.set(sessionId, set);
  }
  return set;
}

export async function emitWorkflowEvent(
  sessionId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<WorkflowStreamEvent> {
  const event: WorkflowStreamEvent = {
    id: nextEventId(),
    eventType,
    payload,
  };
  for (const cb of getSubscribers(sessionId)) {
    await cb(event);
  }
  return event;
}

export function subscribeWorkflowEvents(
  sessionId: string,
  callback: WorkflowEventCallback,
): () => void {
  getSubscribers(sessionId).add(callback);
  return () => getSubscribers(sessionId).delete(callback);
}

export function getActiveRun(sessionId: string): ActiveRun | undefined {
  return activeRuns.get(sessionId);
}

export function isWorkflowRunning(sessionId: string): boolean {
  const run = activeRuns.get(sessionId);
  return run?.status === "running";
}

export class WorkflowConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowConflictError";
  }
}

export class WorkflowUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowUnavailableError";
  }
}

/**
 * Start or resume LangGraph execution for a session (async).
 * Delegates to createThinkTankGraph — does not call OpenAI from API routes.
 */
export async function startSessionWorkflow(
  sessionId: string,
  topic: string,
  options: {
    debateRounds?: number;
    action?: "start" | "approve" | "reject";
    reviewNote?: string;
    onPersistEvent?: (event: WorkflowStreamEvent) => Promise<void>;
  } = {},
): Promise<{ runId: string; status: string }> {
  if (isWorkflowRunning(sessionId)) {
    throw new WorkflowConflictError(
      "Workflow is already running for this session",
    );
  }

  const runId = `run_${sessionId}_${Date.now()}`;
  const run: ActiveRun = {
    sessionId,
    runId,
    status: "running",
    phase: "analysis",
    startedAt: new Date(),
  };
  activeRuns.set(sessionId, run);

  const persist = async (eventType: string, payload: Record<string, unknown>) => {
    const event = await emitWorkflowEvent(sessionId, eventType, payload);
    if (options.onPersistEvent) {
      await options.onPersistEvent(event);
    }
    return event;
  };

  void (async () => {
    try {
      const graph = createThinkTankGraph();
      let state: ThinkTankState = initialThinkTankState(sessionId, topic);

      await persist("phase_change", { phase: "analysis" });
      run.phase = "analysis";

      state = await graph.invoke(state);
      await persist("analysis_progress", {
        complete: true,
        count: state.completedAgentIds.length,
      });

      await persist("phase_change", { phase: "debate" });
      run.phase = "debate";

      const rounds = options.debateRounds ?? 2;
      for (let round = 1; round <= rounds; round++) {
        await persist("debate_turn", {
          turn: {
            id: `stub-${round}`,
            agentId: "peace_conflict",
            round,
            content: `[stub] Debate round ${round} for session ${sessionId}`,
          },
        });
      }

      await persist("phase_change", { phase: "consensus" });
      run.phase = "consensus";
      await persist("consensus_update", {
        confidenceScore: 0.75,
        ethicsCleared: true,
      });

      await persist("phase_change", { phase: "report" });
      run.phase = "report";
      await persist("report_section", {
        section: "executive_summary",
        title: "Executive Summary",
      });

      run.status = "completed";
      run.phase = "done";
      await persist("complete", { sessionId, status: "completed" });
    } catch (err) {
      run.status = "failed";
      const message = err instanceof Error ? err.message : "Workflow failed";
      await persist("error", { message });
    } finally {
      activeRuns.delete(sessionId);
    }
  })();

  return { runId, status: "running" };
}

export function getWorkflowStatus(sessionId: string): {
  sessionId: string;
  status: string;
  phase: string;
  runId: string | null;
  running: boolean;
} {
  const active = activeRuns.get(sessionId);
  if (active) {
    return {
      sessionId,
      status: active.status,
      phase: active.phase,
      runId: active.runId,
      running: true,
    };
  }
  return {
    sessionId,
    status: "idle",
    phase: "unknown",
    runId: null,
    running: false,
  };
}
