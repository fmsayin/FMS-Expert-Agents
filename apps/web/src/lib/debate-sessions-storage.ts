import type {
  RoundTableChatMessage,
  ThinkTankAnalysis,
  TurkishExecutiveReport,
  TurkishSummaryEntry,
} from "@/components/roundtable/types";

export const ROUNDTABLE_SESSIONS_STORAGE_KEY = "fms-roundtable-sessions";

export type DebateSession = {
  id: string;
  topic: string;
  topicFull: string;
  participants: string[];
  participantIds: string[];
  messages: RoundTableChatMessage[];
  englishAnalysis: ThinkTankAnalysis | null;
  turkishReport: TurkishExecutiveReport | null;
  turkishSummaries: TurkishSummaryEntry[];
  notes: string;
  bookmarked: boolean;
  createdAt: number;
  updatedAt: number;
  durationSeconds: number;
  themeId?: string;
  topicId?: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): DebateSession[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(ROUNDTABLE_SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DebateSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: DebateSession[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ROUNDTABLE_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

export function listDebateSessions(): DebateSession[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getDebateSession(id: string): DebateSession | null {
  return readAll().find((s) => s.id === id) ?? null;
}

export function saveDebateSession(
  input: Omit<DebateSession, "id" | "createdAt" | "updatedAt"> & { id?: string },
): DebateSession {
  const now = Date.now();
  const sessions = readAll();
  const existingIdx = input.id ? sessions.findIndex((s) => s.id === input.id) : -1;

  if (existingIdx >= 0) {
    const updated: DebateSession = {
      ...sessions[existingIdx],
      ...input,
      id: sessions[existingIdx].id,
      createdAt: sessions[existingIdx].createdAt,
      updatedAt: now,
    };
    sessions[existingIdx] = updated;
    writeAll(sessions);
    return updated;
  }

  const created: DebateSession = {
    ...input,
    id: input.id ?? `session-${now}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([created, ...sessions]);
  return created;
}

export function deleteDebateSession(id: string): boolean {
  const sessions = readAll().filter((s) => s.id !== id);
  if (sessions.length === readAll().length) return false;
  writeAll(sessions);
  return true;
}

export function toggleDebateBookmark(id: string): DebateSession | null {
  const sessions = readAll();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  sessions[idx] = { ...sessions[idx], bookmarked: !sessions[idx].bookmarked, updatedAt: Date.now() };
  writeAll(sessions);
  return sessions[idx];
}

export function updateDebateSessionNotes(id: string, notes: string): DebateSession | null {
  const sessions = readAll();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  sessions[idx] = { ...sessions[idx], notes, updatedAt: Date.now() };
  writeAll(sessions);
  return sessions[idx];
}
