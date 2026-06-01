import type {
  CreateSessionBody,
  SessionDetail,
  SessionSummary,
} from "@fms/shared";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function listSessions(params?: {
  limit?: number;
  cursor?: string;
  status?: string;
}): Promise<{ sessions: SessionSummary[]; nextCursor?: string | null }> {
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.cursor) q.set("cursor", params.cursor);
  if (params?.status) q.set("status", params.status);
  const suffix = q.toString() ? `?${q}` : "";
  return parseJson(await fetch(`/api/sessions${suffix}`));
}

export async function createSession(
  body: CreateSessionBody,
): Promise<{ sessionId: string }> {
  const data = await parseJson<{ session: { id: string } }>(
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  return { sessionId: data.session.id };
}

export async function startSession(sessionId: string): Promise<void> {
  await parseJson(
    await fetch(`/api/sessions/${sessionId}/run`, { method: "POST" }),
  );
}

export async function getSession(sessionId: string): Promise<SessionDetail> {
  return parseJson(
    await fetch(`/api/sessions/${sessionId}`, { cache: "no-store" }),
  );
}

export interface DebateTurn {
  id: string;
  agentId: string;
  round: number;
  sequence: number;
  content: string;
  metadata?: { stance?: string };
}

export async function getDebate(sessionId: string): Promise<{
  sessionId: string;
  turns: DebateTurn[];
}> {
  return parseJson(await fetch(`/api/sessions/${sessionId}/debate`));
}

export interface AgentAnalysis {
  agentId: string;
  summary: string;
  confidence?: number;
}

export async function getAnalyses(sessionId: string): Promise<{
  sessionId: string;
  analyses: AgentAnalysis[];
}> {
  return parseJson(await fetch(`/api/sessions/${sessionId}/analyses`));
}

export interface ConsensusDraft {
  recommendationSummary: string;
  strategicPillars: { title: string; description: string }[];
  phasedActions: { phase: string; actions: string[] }[];
  dissent: { agentId: string; position: string }[];
  confidenceScore: number;
  ethicsCleared: boolean;
  blockingConcerns: string[];
}

export async function getConsensus(sessionId: string): Promise<{ draft: ConsensusDraft }> {
  return parseJson(await fetch(`/api/sessions/${sessionId}/consensus`));
}

export interface SessionReport {
  id: string;
  version: number;
  markdown: string;
  createdAt: string;
}

export async function getReport(sessionId: string): Promise<{ report: SessionReport }> {
  return parseJson(await fetch(`/api/sessions/${sessionId}/report`));
}

export type StreamEvent =
  | { type: "debate_turn"; turn: DebateTurn }
  | { type: "phase_change"; phase: string }
  | { type: "complete" }
  | { type: "error"; message: string }
  | { type: "unknown" };

export function parseStreamPayload(
  eventName: string | null,
  raw: string,
): StreamEvent | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const name = eventName ?? "message";

    if (name === "debate_turn" && data.turn) {
      return { type: "debate_turn", turn: data.turn as DebateTurn };
    }
    if (name === "phase_change" && data.phase) {
      return { type: "phase_change", phase: String(data.phase) };
    }
    if (name === "complete" || data.type === "complete") {
      return { type: "complete" };
    }
    if (name === "error" || data.error) {
      return {
        type: "error",
        message: String(data.message ?? data.error ?? "Stream error"),
      };
    }
    return { type: "unknown" };
  } catch {
    return null;
  }
}
