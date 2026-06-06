import type { HistoricalFigure } from "@/data/historical-figures";
import {
  buildFigureSystemPrompt,
  getHistoricalFigureById,
  HISTORICAL_FIGURES,
} from "@/data/historical-figures";
import {
  type CustomFigure,
  customFigureStorageId,
  isCustomFigureStorageId,
  parseCustomFigureUuid,
} from "@/lib/custom-figures-storage";
import { sortHistoricalFiguresByName } from "@/lib/figure-sort";

export type CustomFigurePayload = {
  fullName: string;
  activeYears?: string;
  titleRole?: string;
  shortDescription?: string;
  biography?: string;
  expertise?: string | string[];
  leadershipStyle?: string;
  ideologyPhilosophy?: string;
  debateStyle?: string;
  keyAchievements?: string;
  historicalContext?: string;
  notableQuotes?: string;
  profileImageUrl?: string;
};

const DEFAULT_CUSTOM_TAGS = ["Statecraft", "Governance"];

export function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) {
    return words[0]!.slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function expertiseToString(expertise?: string | string[]): string {
  if (!expertise) return "";
  if (Array.isArray(expertise)) {
    return expertise
      .filter((s) => typeof s === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");
  }
  return expertise.trim();
}

/** Title-case tag labels to match built-in figures (e.g. "Military Strategy") */
export function formatExpertiseTag(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 3 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Parse comma/semicolon-separated expertise into 2–4 display tags */
export function parseExpertiseTags(
  expertise?: string | string[],
  titleRole?: string,
): string[] {
  const source = expertiseToString(expertise) || titleRole?.trim() || "";
  if (!source) return [...DEFAULT_CUSTOM_TAGS];

  const parts = source
    .split(/[,;|/]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return [...DEFAULT_CUSTOM_TAGS];

  const tags = parts.slice(0, 4).map((t) => {
    const formatted = formatExpertiseTag(t);
    if (formatted.length <= 28) return formatted;
    return `${formatted.slice(0, 25)}…`;
  });

  return tags.length >= 2 ? tags : [...tags, ...DEFAULT_CUSTOM_TAGS].slice(0, 4);
}

export function customFigureToPayload(custom: CustomFigure): CustomFigurePayload {
  return {
    fullName: custom.fullName,
    activeYears: custom.activeYears || undefined,
    titleRole: custom.titleRole || undefined,
    shortDescription: custom.shortDescription || undefined,
    biography: custom.biography || undefined,
    expertise: custom.expertise || undefined,
    leadershipStyle: custom.leadershipStyle || undefined,
    ideologyPhilosophy: custom.ideologyPhilosophy || undefined,
    debateStyle: custom.debateStyle || undefined,
    keyAchievements: custom.keyAchievements || undefined,
    historicalContext: custom.historicalContext || undefined,
    notableQuotes: custom.notableQuotes || undefined,
    profileImageUrl: custom.profileImageUrl || undefined,
  };
}

export function buildCustomFigureStyle(payload: CustomFigurePayload): string {
  const parts: string[] = [];
  const push = (label: string, value?: string) => {
    const v = value?.trim();
    if (v) parts.push(`${label}: ${v}`);
  };

  const bio = payload.biography?.trim();
  if (bio) parts.push(bio);

  push("Short description", payload.shortDescription);
  push("Areas of expertise", expertiseToString(payload.expertise));
  push("Leadership style", payload.leadershipStyle);
  push("Ideology and philosophy", payload.ideologyPhilosophy);
  push("Debate style", payload.debateStyle);
  push("Key achievements", payload.keyAchievements);
  push("Historical context", payload.historicalContext);
  push("Notable quotes", payload.notableQuotes);

  if (parts.length > 0) return parts.join("\n\n");

  const name = payload.fullName.trim();
  const role = payload.titleRole?.trim() || "historical figure";
  const years = payload.activeYears?.trim() || "their era";
  return `I speak as ${name}, ${role}, from ${years}.`;
}

function resolveCardRole(payload: CustomFigurePayload): string {
  const title = payload.titleRole?.trim();
  if (title) return title.length > 120 ? `${title.slice(0, 117)}…` : title;

  const short = payload.shortDescription?.trim();
  if (short) return short.length > 120 ? `${short.slice(0, 117)}…` : short;

  const firstTag = parseExpertiseTags(payload.expertise, payload.titleRole)[0];
  return firstTag || "Historical figure";
}

export function customFigureToHistoricalFigure(
  custom: CustomFigure,
): HistoricalFigure {
  const payload = customFigureToPayload(custom);

  return {
    id: customFigureStorageId(custom.id),
    name: custom.fullName,
    initials: deriveInitials(custom.fullName),
    era: custom.activeYears.trim() || "—",
    role: resolveCardRole(payload),
    expertiseTags: parseExpertiseTags(custom.expertise, custom.titleRole),
    style: buildCustomFigureStyle(payload),
  };
}

export function payloadToHistoricalFigure(
  figureId: string,
  payload: CustomFigurePayload,
): HistoricalFigure {
  return {
    id: figureId,
    name: payload.fullName,
    initials: deriveInitials(payload.fullName),
    era: payload.activeYears?.trim() || "—",
    role: resolveCardRole(payload),
    expertiseTags: parseExpertiseTags(payload.expertise, payload.titleRole),
    style: buildCustomFigureStyle(payload),
  };
}

export function getAllFigures(customFigures: CustomFigure[]): HistoricalFigure[] {
  return sortHistoricalFiguresByName([
    ...HISTORICAL_FIGURES,
    ...customFigures.map(customFigureToHistoricalFigure),
  ]);
}

export function getFigureById(
  id: string,
  customFigures: CustomFigure[],
): HistoricalFigure | undefined {
  const builtin = getHistoricalFigureById(id);
  if (builtin) return builtin;

  if (!isCustomFigureStorageId(id)) return undefined;

  const uuid = parseCustomFigureUuid(id);
  if (!uuid) return undefined;

  const custom = customFigures.find((f) => f.id === uuid);
  if (!custom) return undefined;

  return customFigureToHistoricalFigure(custom);
}

export { buildFigureSystemPrompt };
