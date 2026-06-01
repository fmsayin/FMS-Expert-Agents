import { AGENT_REGISTRY } from "@fms/agents";
import { ALL_AGENT_IDS, type AgentId } from "@fms/shared";

export const MISSION_STATEMENT =
  "Building Peace Through Intelligence, Diplomacy, and Human Dignity";

export type AccentGroup =
  | "governance"
  | "security"
  | "diplomacy"
  | "humanitarian"
  | "economy"
  | "culture"
  | "ethics";

export interface AgentMeta {
  id: AgentId;
  displayName: string;
  initials: string;
  accentGroup: AccentGroup;
  ethicsVeto: boolean;
}

const ACCENT_BY_AGENT: Record<AgentId, AccentGroup> = {
  chief_peace_architect: "governance",
  peace_conflict: "security",
  diplomacy_ir: "diplomacy",
  strategic_security: "security",
  humanitarian: "humanitarian",
  ai_peace: "governance",
  economic_dev: "economy",
  civilization_culture: "culture",
  education_youth: "culture",
  media_comms: "diplomacy",
  environmental_security: "security",
  space_future: "governance",
  ethics_rights: "ethics",
};

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const ALL_AGENTS: AgentMeta[] = ALL_AGENT_IDS.map((id) => {
  const def = AGENT_REGISTRY[id];
  return {
    id,
    displayName: def.displayName,
    initials: initialsFromName(def.displayName),
    accentGroup: ACCENT_BY_AGENT[id],
    ethicsVeto: def.ethicsVeto,
  };
});

export function getAgentMetaById(id: string): AgentMeta | undefined {
  return ALL_AGENTS.find((a) => a.id === id);
}

export const AGENT_ACCENT_CLASSES: Record<AccentGroup, string> = {
  governance: "bg-primary/15 text-primary ring-primary/30",
  security: "bg-slate-700/10 text-slate-800 ring-slate-400/40",
  diplomacy: "bg-secondary text-secondary-foreground ring-border",
  humanitarian: "bg-rose-100/80 text-rose-900 ring-rose-300/50",
  economy: "bg-amber-100/80 text-amber-950 ring-gold/40",
  culture: "bg-violet-100/80 text-violet-900 ring-violet-300/50",
  ethics: "bg-accent/15 text-accent ring-accent/30",
};
