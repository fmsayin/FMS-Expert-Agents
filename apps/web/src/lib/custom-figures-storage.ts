import { sortCustomFiguresByName } from "@/lib/figure-sort";

export const CUSTOM_FIGURES_STORAGE_KEY = "fms-roundtable-custom-figures";

export const CUSTOM_FIGURE_LIMITS = {
  fullName: 80,
  activeYears: 60,
  titleRole: 120,
  shortDescription: 300,
  biography: 2000,
  expertise: 2000,
  leadershipStyle: 2000,
  ideologyPhilosophy: 2000,
  debateStyle: 2000,
  keyAchievements: 2000,
  historicalContext: 2000,
  notableQuotes: 2000,
  profileImageUrl: 500_000,
} as const;

export type CustomFigure = {
  id: string;
  fullName: string;
  activeYears: string;
  titleRole: string;
  shortDescription: string;
  biography: string;
  expertise: string;
  leadershipStyle: string;
  ideologyPhilosophy: string;
  debateStyle: string;
  keyAchievements: string;
  historicalContext: string;
  notableQuotes: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomFigureInput = Omit<CustomFigure, "id" | "createdAt" | "updatedAt">;

/** Fields returned by AI enrichment (subset of input, all strings) */
export type CustomFigureEnrichment = CustomFigureInput;

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeExpertise(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "string") return value;
  return "";
}

/** Migrate legacy records (name, role, era, personality) to the expanded schema */
function migrateStoredFigure(raw: Record<string, unknown>): CustomFigure | null {
  const fullName =
    (typeof raw.fullName === "string" ? raw.fullName : "") ||
    (typeof raw.name === "string" ? raw.name : "");
  const trimmedName = fullName.trim();
  if (!trimmedName) return null;

  const id = typeof raw.id === "string" ? raw.id : crypto.randomUUID();
  const createdAt =
    typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString();
  const updatedAt =
    typeof raw.updatedAt === "string" ? raw.updatedAt : createdAt;

  const legacyPersonality =
    typeof raw.personality === "string" ? raw.personality : "";
  const legacyBiography = typeof raw.biography === "string" ? raw.biography : "";

  return {
    id,
    fullName: trimmedName.slice(0, CUSTOM_FIGURE_LIMITS.fullName),
    activeYears: (
      (typeof raw.activeYears === "string" ? raw.activeYears : "") ||
      (typeof raw.era === "string" ? raw.era : "")
    ).slice(0, CUSTOM_FIGURE_LIMITS.activeYears),
    titleRole: (
      (typeof raw.titleRole === "string" ? raw.titleRole : "") ||
      (typeof raw.role === "string" ? raw.role : "")
    ).slice(0, CUSTOM_FIGURE_LIMITS.titleRole),
    shortDescription: (
      typeof raw.shortDescription === "string" ? raw.shortDescription : ""
    ).slice(0, CUSTOM_FIGURE_LIMITS.shortDescription),
    biography: (
      (typeof raw.biography === "string" ? raw.biography : "") || legacyBiography
    ).slice(0, CUSTOM_FIGURE_LIMITS.biography),
    expertise: normalizeExpertise(raw.expertise).slice(
      0,
      CUSTOM_FIGURE_LIMITS.expertise,
    ),
    leadershipStyle: (
      (typeof raw.leadershipStyle === "string" ? raw.leadershipStyle : "") ||
      legacyPersonality
    ).slice(0, CUSTOM_FIGURE_LIMITS.leadershipStyle),
    ideologyPhilosophy: (
      typeof raw.ideologyPhilosophy === "string" ? raw.ideologyPhilosophy : ""
    ).slice(0, CUSTOM_FIGURE_LIMITS.ideologyPhilosophy),
    debateStyle: (
      typeof raw.debateStyle === "string" ? raw.debateStyle : ""
    ).slice(0, CUSTOM_FIGURE_LIMITS.debateStyle),
    keyAchievements: (
      typeof raw.keyAchievements === "string" ? raw.keyAchievements : ""
    ).slice(0, CUSTOM_FIGURE_LIMITS.keyAchievements),
    historicalContext: (
      typeof raw.historicalContext === "string" ? raw.historicalContext : ""
    ).slice(0, CUSTOM_FIGURE_LIMITS.historicalContext),
    notableQuotes: (
      typeof raw.notableQuotes === "string" ? raw.notableQuotes : ""
    ).slice(0, CUSTOM_FIGURE_LIMITS.notableQuotes),
    profileImageUrl: (
      typeof raw.profileImageUrl === "string" ? raw.profileImageUrl : ""
    ).slice(0, CUSTOM_FIGURE_LIMITS.profileImageUrl),
    createdAt,
    updatedAt,
  };
}

function readRaw(): CustomFigure[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_FIGURES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) =>
        item && typeof item === "object"
          ? migrateStoredFigure(item as Record<string, unknown>)
          : null,
      )
      .filter((f): f is CustomFigure => f !== null);
  } catch {
    return [];
  }
}

function writeAll(figures: CustomFigure[]): void {
  if (!isClient()) return;
  window.localStorage.setItem(CUSTOM_FIGURES_STORAGE_KEY, JSON.stringify(figures));
}

export function listCustomFigures(): CustomFigure[] {
  return sortCustomFiguresByName(readRaw());
}

export function getCustomFigureById(id: string): CustomFigure | undefined {
  return readRaw().find((f) => f.id === id);
}

export function addCustomFigure(input: CustomFigureInput): CustomFigure {
  const now = new Date().toISOString();
  const figure: CustomFigure = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  const figures = readRaw();
  writeAll([figure, ...figures]);
  return figure;
}

export function updateCustomFigure(
  id: string,
  input: CustomFigureInput,
): CustomFigure | undefined {
  const figures = readRaw();
  const index = figures.findIndex((f) => f.id === id);
  if (index === -1) return undefined;
  const updated: CustomFigure = {
    ...figures[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  figures[index] = updated;
  writeAll(figures);
  return updated;
}

export function deleteCustomFigure(id: string): boolean {
  const figures = readRaw();
  const next = figures.filter((f) => f.id !== id);
  if (next.length === figures.length) return false;
  writeAll(next);
  return true;
}

export function customFigureStorageId(uuid: string): string {
  return `custom-${uuid}`;
}

export function isCustomFigureStorageId(id: string): boolean {
  return id.startsWith("custom-");
}

export function parseCustomFigureUuid(figureId: string): string | null {
  if (!isCustomFigureStorageId(figureId)) return null;
  return figureId.slice("custom-".length) || null;
}
