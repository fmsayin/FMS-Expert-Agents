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

export interface ResearchOutput {
  id: string;
  title: string;
  type: "Policy Brief" | "Strategic Review" | "Working Paper" | "Framework";
  date: string;
  summary: string;
  tags: string[];
}

export interface Project {
  id: string;
  title: string;
  status: "Active" | "Completed" | "Planning";
  lead: string;
  summary: string;
  agents: string[];
}
