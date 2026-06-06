export type RoundTableTopic = {
  id: string;
  label: string;
  full: string;
};

export const ROUNDTABLE_TOPICS: RoundTableTopic[] = [
  { id: "peace-diplomacy", label: "Peace & Diplomacy", full: "Peace & Diplomacy" },
  { id: "conflict-resolution", label: "Conflict Resolution", full: "Conflict Resolution" },
  {
    id: "artificial-intelligence-policy",
    label: "Artificial Intelligence Policy",
    full: "Artificial Intelligence Policy",
  },
  {
    id: "international-relations",
    label: "International Relations",
    full: "International Relations",
  },
  { id: "humanitarian-policy", label: "Humanitarian Policy", full: "Humanitarian Policy" },
  {
    id: "strategic-security-studies",
    label: "Strategic & Security Studies",
    full: "Strategic & Security Studies",
  },
  {
    id: "technology-future-policy",
    label: "Technology & Future Policy",
    full: "Technology & Future Policy",
  },
  { id: "economy-development", label: "Economy & Development", full: "Economy & Development" },
  { id: "civilization-society", label: "Civilization & Society", full: "Civilization & Society" },
];

export const DEFAULT_ROUNDTABLE_TOPIC_ID = ROUNDTABLE_TOPICS[0]?.id ?? "nato-expansion";

export const CUSTOM_ROUNDTABLE_TOPIC_ID = "custom";

export function getRoundTableTopicById(id: string): RoundTableTopic | undefined {
  return ROUNDTABLE_TOPICS.find((t) => t.id === id);
}

export function buildCustomTopicFull(title: string, description?: string): string {
  const trimmedTitle = title.trim();
  const trimmedDesc = description?.trim();
  if (trimmedDesc) {
    return `${trimmedTitle}\n\n${trimmedDesc}`;
  }
  return trimmedTitle;
}

export function buildPredefinedTopicFull(full: string, description?: string): string {
  const trimmedFull = full.trim();
  const trimmedDesc = description?.trim();
  if (trimmedDesc) {
    return `${trimmedFull}\n\nAdditional context:\n${trimmedDesc}`;
  }
  return trimmedFull;
}
