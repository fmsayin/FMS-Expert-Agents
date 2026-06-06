export const PROJECTS_STORAGE_KEY = "fms-projects";

export type UserProject = {
  id: string;
  name: string;
  description?: string;
  debateSessionIds: string[];
  createdAt: number;
  updatedAt: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): UserProject[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(projects: UserProject[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function listUserProjects(): UserProject[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createUserProject(name: string, description?: string): UserProject {
  const now = Date.now();
  const project: UserProject = {
    id: `proj-${now}-${Math.random().toString(36).slice(2, 9)}`,
    name: name.trim(),
    description: description?.trim() || undefined,
    debateSessionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  writeAll([project, ...readAll()]);
  return project;
}

export function addSessionToProject(projectId: string, sessionId: string): UserProject | null {
  const projects = readAll();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx < 0) return null;
  const ids = projects[idx].debateSessionIds;
  if (!ids.includes(sessionId)) {
    projects[idx] = {
      ...projects[idx],
      debateSessionIds: [...ids, sessionId],
      updatedAt: Date.now(),
    };
    writeAll(projects);
  }
  return projects[idx];
}
