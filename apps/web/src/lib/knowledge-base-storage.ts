export const KNOWLEDGE_BASE_STORAGE_KEY = "fms-knowledge-base";

export type KnowledgeBaseEntryType =
  | "roundtable-debate"
  | "roundtable-brief"
  | "roundtable-memo"
  | "roundtable-summary";

export type KnowledgeBaseEntry = {
  id: string;
  title: string;
  type: KnowledgeBaseEntryType;
  content: string;
  sourceSessionId?: string;
  createdAt: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): KnowledgeBaseEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KNOWLEDGE_BASE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KnowledgeBaseEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: KnowledgeBaseEntry[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(KNOWLEDGE_BASE_STORAGE_KEY, JSON.stringify(entries));
}

export function addKnowledgeBaseEntry(
  input: Omit<KnowledgeBaseEntry, "id" | "createdAt">,
): KnowledgeBaseEntry {
  const entry: KnowledgeBaseEntry = {
    ...input,
    id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
  };
  writeAll([entry, ...readAll()]);
  return entry;
}

export function listKnowledgeBaseEntries(): KnowledgeBaseEntry[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}
