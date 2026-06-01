export const AGENT_CATEGORIES = [
  "AI Governance Agents",
  "Peace & Security Agents",
  "International Relations Agents",
  "Legal & Policy Agents",
  "Research & Writing Agents",
  "Strategic Foresight Agents",
  "Data & Evidence Agents",
] as const;

export type AgentCategory = (typeof AGENT_CATEGORIES)[number];

export type AgentStatus = "Available" | "In Session" | "Offline";

/** @deprecated Use AgentStatus */
export type ShowcaseAgentStatus = AgentStatus;

export interface Agent {
  slug: string;
  name: string;
  specialty: string;
  category: AgentCategory;
  description: string;
  capabilities: string[];
  status: AgentStatus;
}

export type ShowcaseAgent = Agent;

export type ResearchOutputType =
  | "Policy Brief"
  | "Strategic Review"
  | "Working Paper"
  | "Framework"
  | "Academic Article";

export interface ResearchOutput {
  id: string;
  /** Route slug when a full article page exists */
  slug?: string;
  title: string;
  type: ResearchOutputType;
  date: string;
  summary: string;
  tags: string[];
  author?: string;
  affiliation?: string;
  wordCount?: number;
  featured?: boolean;
  /** Markdown file under `content/research/` (without extension) */
  contentSlug?: string;
  abstract?: string;
  keywords?: string[];
  relatedAgentSlugs?: string[];
  relatedCategories?: AgentCategory[];
}

export interface Project {
  id: string;
  title: string;
  status: "Active" | "Completed" | "Planning";
  lead: string;
  summary: string;
  agents: string[];
}
