import type { Project } from "./types";

export const PROJECTS: Project[] = [
  {
    id: "peace-architecture-lab",
    title: "Peace Architecture Lab",
    status: "Active",
    lead: "Chief Peace Architect",
    summary:
      "Multi-agent synthesis platform for strategic peace recommendations across 13 operational domain experts.",
    agents: ["chief-peace-architect", "conflict-mediation-specialist", "diplomatic-affairs-specialist"],
  },
  {
    id: "ai-governance-observatory",
    title: "AI Governance Observatory",
    status: "Active",
    lead: "AI Governance Analyst",
    summary:
      "Tracks regulatory developments, dual-use risks, and governance frameworks for AI in conflict prevention.",
    agents: ["ai-governance-analyst", "ai-safety-alignment-reviewer"],
  },
  {
    id: "humanitarian-access-initiative",
    title: "Humanitarian Access Initiative",
    status: "Planning",
    lead: "International Humanitarian Law Advisor",
    summary:
      "Develops IHL-aligned protocols for protected corridors and civilian harm mitigation in active conflict zones.",
    agents: ["ihl-advisor", "conflict-mediation-specialist"],
  },
  {
    id: "foresight-horizon-scan",
    title: "Foresight Horizon Scan 2026",
    status: "Active",
    lead: "Scenario Planning Analyst",
    summary:
      "Annual horizon scan integrating geopolitical risk, emerging technology threats, and peace opportunity windows.",
    agents: ["scenario-planning-analyst", "geopolitical-risk-forecaster"],
  },
  {
    id: "evidence-peace-programs",
    title: "Evidence for Peace Programs",
    status: "Completed",
    lead: "Impact Evaluation Specialist",
    summary:
      "Completed meta-evaluation of peacebuilding program evidence with recommendations for M&E standardization.",
    agents: ["impact-evaluation-specialist", "evidence-mapping-coordinator"],
  },
];
