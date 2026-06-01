import type { ResearchOutput } from "./types";

export const RESEARCH_OUTPUTS: ResearchOutput[] = [
  {
    id: "ai-diplomacy-sustainable-peace",
    slug: "ai-diplomacy-sustainable-peace",
    title: "AI-Powered Diplomacy and the Architecture of Sustainable Peace",
    type: "Flagship Policy Publication / Strategic Review",
    date: "2026-05",
    summary:
      "Inaugural FMS Strategic Review volume on how AI-augmented preventive diplomacy, multilateral governance, and human dignity can strengthen sustainable peace—grounded in thirteen expert domains and the Global Diplomatic AI Compact (GDAIC).",
    tags: [
      "AI Governance",
      "Preventive Diplomacy",
      "Peace Architecture",
      "Multilateral Governance",
      "GDAIC",
    ],
    author: "Dr. Fatih Sayin",
    affiliation:
      "FMS Strategic Review, Volume 1, Issue 1 (2026) · Foundation for Multilateral Strategies (FMS)",
    wordCount: 22000,
    featured: true,
    contentSlug: "ai-diplomacy-sustainable-peace",
    abstract:
      "Artificial intelligence is reshaping international relations faster than norms and accountability mechanisms can adapt. This inaugural FMS Strategic Review synthesizes thirteen interdisciplinary expert perspectives to argue that AI can materially strengthen preventive diplomacy and sustainable peacebuilding only when subordinated to international law, anchored in human rights, and governed through inclusive multilateral frameworks—not unilateral military or commercial advantage.",
    keywords: [
      "artificial intelligence",
      "preventive diplomacy",
      "peacebuilding",
      "multilateral governance",
      "Global Diplomatic AI Compact",
      "human dignity",
      "dual-use AI",
      "early warning",
    ],
    relatedAgentSlugs: [
      "ai-governance-analyst",
      "diplomatic-affairs-specialist",
      "chief-peace-architect",
      "multilateral-diplomacy-advisor",
      "policy-brief-writer",
    ],
    relatedCategories: [
      "AI Governance Agents",
      "International Relations Agents",
      "Peace & Security Agents",
      "Research & Writing Agents",
    ],
  },
  {
    id: "authoritarian-exit-dilemma",
    slug: "authoritarian-exit-dilemma",
    title:
      "Authoritarian Exit Dilemmas and Democratic Transition: The Role of Credible Exit Guarantees in Conflict Prevention",
    type: "Academic Article",
    date: "2026-05",
    summary:
      "Formalizes the Authoritarian Exit Dilemma and applies comparative process-tracing across eight cases to explain when credible exit guarantees reduce violence and enable democratic transition.",
    tags: [
      "Democratization",
      "Authoritarian Exit",
      "Transitional Justice",
      "Conflict Prevention",
      "Political Settlements",
    ],
    author: "Dr. Fatih Sayin",
    affiliation: "Foundation for Multilateral Strategies (FMS)",
    wordCount: 5780,
    featured: false,
    contentSlug: "authoritarian-exit-dilemma",
    abstract:
      "This article examines why authoritarian leaders frequently escalate repression during political crises, and whether credible post-exit guarantees—negotiated transitions, exile arrangements, conditional amnesties, and transitional justice mechanisms—can reduce violence and facilitate democratic transition.",
    keywords: [
      "authoritarian exit dilemma",
      "democratic transition",
      "credible exit guarantees",
      "transitional justice",
      "political settlements",
      "conflict prevention",
      "elite bargaining",
      "amnesty",
      "exile",
      "repression",
    ],
    relatedAgentSlugs: [
      "transitional-justice-specialist",
      "conflict-mediation-specialist",
      "post-conflict-stabilization-advisor",
    ],
    relatedCategories: [
      "Peace & Security Agents",
      "International Relations Agents",
      "Legal & Policy Agents",
    ],
  },
  {
    id: "gdaic-framework",
    title: "Governance-Driven AI for International Conflict (GDAIC) Framework",
    type: "Framework",
    date: "2025-09",
    summary:
      "Proposes a governance-first framework for deploying AI tools in mediation, monitoring, and accountability contexts.",
    tags: ["AI Governance", "Mediation", "Framework"],
  },
  {
    id: "red-sea-brief",
    title: "Red Sea Shipping De-escalation: Policy Options Brief",
    type: "Policy Brief",
    date: "2025-08",
    summary:
      "Synthesizes diplomatic, security, and humanitarian measures to reduce attacks on commercial shipping corridors.",
    tags: ["Maritime Security", "Diplomacy", "Humanitarian Access"],
  },
  {
    id: "sahel-stabilization",
    title: "Sahel Stabilization Pathways: Inclusive Governance Under Extremist Pressure",
    type: "Policy Brief",
    date: "2025-07",
    summary:
      "Maps regional governance reforms, security cooperation, and youth inclusion measures for Sahel stabilization.",
    tags: ["Sahel", "Governance", "Youth Inclusion"],
  },
  {
    id: "ceasefire-verification",
    title: "Independent Ceasefire Verification: Design Principles for Fragile Contexts",
    type: "Working Paper",
    date: "2025-06",
    summary:
      "Outlines verification architectures that balance independence, local legitimacy, and real-time monitoring capacity.",
    tags: ["Ceasefire", "Verification", "Peace Operations"],
  },
];

export const FEATURED_OUTPUT = RESEARCH_OUTPUTS.find((o) => o.featured);

export function getResearchOutputBySlug(slug: string): ResearchOutput | undefined {
  return RESEARCH_OUTPUTS.find((o) => o.slug === slug);
}

export function getArticleSlugs(): string[] {
  return RESEARCH_OUTPUTS.filter((o) => o.slug && o.contentSlug).map((o) => o.slug!);
}
