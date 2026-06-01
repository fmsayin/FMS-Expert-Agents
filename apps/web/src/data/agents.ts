import type { Agent, AgentCategory } from "./types";

function agents(
  category: AgentCategory,
  items: Omit<Agent, "category">[],
): Agent[] {
  return items.map((item) => ({ ...item, category }));
}

export const AGENTS: Agent[] = [
  ...agents("AI Governance Agents", [
    {
      slug: "ai-governance-analyst",
      name: "AI Governance Analyst",
      specialty: "AI Policy, Risk, and Regulation",
      description:
        "Evaluates AI governance frameworks, regulatory alignment, and institutional risk for peace and security applications.",
      capabilities: [
        "Literature review",
        "Policy brief drafting",
        "Risk analysis",
        "Governance framework comparison",
      ],
      status: "Available",
    },
    {
      slug: "algorithmic-accountability-specialist",
      name: "Algorithmic Accountability Specialist",
      specialty: "Audit, Transparency, and Compliance",
      description:
        "Assesses algorithmic systems for bias, accountability gaps, and compliance with emerging AI standards.",
      capabilities: [
        "Algorithm impact assessment",
        "Transparency mapping",
        "Compliance gap analysis",
        "Stakeholder briefing",
      ],
      status: "In Session",
    },
    {
      slug: "ai-safety-alignment-reviewer",
      name: "AI Safety & Alignment Reviewer",
      specialty: "Dual-Use and Safety Protocols",
      description:
        "Reviews AI deployment risks in conflict settings and recommends safety guardrails for peace technology.",
      capabilities: [
        "Dual-use risk screening",
        "Safety protocol design",
        "Red-team scenario review",
        "Ethics integration",
      ],
      status: "Available",
    },
    {
      slug: "digital-sovereignty-advisor",
      name: "Digital Sovereignty Advisor",
      specialty: "Data Governance and Cross-Border AI",
      description:
        "Advises on data localization, cross-border AI flows, and sovereign digital infrastructure in fragile states.",
      capabilities: [
        "Data governance mapping",
        "Cross-border policy analysis",
        "Infrastructure risk review",
        "Treaty alignment",
      ],
      status: "Offline",
    },
  ]),
  ...agents("Peace & Security Agents", [
    {
      slug: "chief-peace-architect",
      name: "Chief Peace Architect",
      specialty: "Integrative Peace Strategy & Synthesis",
      description:
        "Chairs cross-domain expert synthesis, FMS Peace Architecture design, and strategic recommendations for sustainable peace outcomes.",
      capabilities: [
        "Cross-domain synthesis",
        "Peace architecture design",
        "SPR report integration",
        "Consensus facilitation",
      ],
      status: "In Session",
    },
    {
      slug: "conflict-mediation-specialist",
      name: "Conflict Mediation Specialist",
      specialty: "Track II Mediation and Dialogue Design",
      description:
        "Designs mediation pathways, confidence-building measures, and inclusive dialogue structures for protracted conflicts.",
      capabilities: [
        "Mediation pathway design",
        "Stakeholder mapping",
        "CBM drafting",
        "Facilitation protocols",
      ],
      status: "Available",
    },
    {
      slug: "ceasefire-verification-analyst",
      name: "Ceasefire Verification Analyst",
      specialty: "Monitoring and Compliance",
      description:
        "Develops verification mechanisms, monitoring indicators, and compliance frameworks for ceasefire agreements.",
      capabilities: [
        "Verification framework design",
        "Indicator development",
        "Monitoring briefs",
        "Spoiler analysis",
      ],
      status: "Available",
    },
    {
      slug: "peace-operations-planner",
      name: "Peace Operations Planner",
      specialty: "Mission Design and Mandates",
      description:
        "Supports planning for peace operations, mandate drafting, and civil-military coordination in complex environments.",
      capabilities: [
        "Mandate analysis",
        "Mission planning support",
        "Civil-military coordination",
        "Lessons-learned synthesis",
      ],
      status: "Offline",
    },
    {
      slug: "post-conflict-stabilization-advisor",
      name: "Post-Conflict Stabilization Advisor",
      specialty: "Transition and DDR",
      description:
        "Advises on disarmament, demobilization, reintegration, and early recovery in post-conflict transitions.",
      capabilities: [
        "DDR program review",
        "Transition roadmap drafting",
        "Security sector reform analysis",
        "Community reintegration planning",
      ],
      status: "Available",
    },
  ]),
  ...agents("International Relations Agents", [
    {
      slug: "diplomatic-affairs-specialist",
      name: "Diplomatic Affairs Specialist",
      specialty: "Preventive Diplomacy & Multilateral Strategy",
      description:
        "Advises on treaty design, multilateral forums, and AI-augmented diplomatic sequencing aligned with the FMS Strategic Review.",
      capabilities: [
        "Treaty analysis",
        "Multilateral forum strategy",
        "Diplomatic sequencing",
        "GDAIC alignment review",
      ],
      status: "In Session",
    },
    {
      slug: "humanitarian-affairs-specialist",
      name: "Humanitarian Affairs Specialist",
      specialty: "Protection, Access & IHL Integration",
      description:
        "Integrates humanitarian protection, civilian harm mitigation, and IHL compliance into peace and diplomatic AI workflows.",
      capabilities: [
        "Humanitarian access protocols",
        "IHL compliance review",
        "Civilian protection analysis",
        "Humanitarian firewall design",
      ],
      status: "Available",
    },
    {
      slug: "multilateral-diplomacy-advisor",
      name: "Multilateral Diplomacy Advisor",
      specialty: "UN, Regional Bodies, and Coalitions",
      description:
        "Analyzes multilateral forums, coalition dynamics, and diplomatic sequencing for conflict de-escalation.",
      capabilities: [
        "Forum strategy analysis",
        "Coalition mapping",
        "Diplomatic sequencing",
        "Resolution drafting support",
      ],
      status: "Available",
    },
    {
      slug: "alliance-dynamics-analyst",
      name: "Alliance Dynamics Analyst",
      specialty: "Alliance Cohesion and Burden-Sharing",
      description:
        "Examines alliance commitments, burden-sharing tensions, and collective security implications for regional stability.",
      capabilities: [
        "Alliance stress testing",
        "Commitment analysis",
        "Burden-sharing review",
        "Strategic communication briefs",
      ],
      status: "Offline",
    },
    {
      slug: "regional-security-architect",
      name: "Regional Security Architect",
      specialty: "Regional Orders and Spillover",
      description:
        "Maps regional security architectures, spillover risks, and cooperative security arrangements.",
      capabilities: [
        "Regional order mapping",
        "Spillover risk assessment",
        "Security architecture comparison",
        "Regional brief drafting",
      ],
      status: "Available",
    },
    {
      slug: "treaty-negotiation-specialist",
      name: "Treaty Negotiation Specialist",
      specialty: "Treaty Design and Implementation",
      description:
        "Supports treaty text development, implementation timelines, and verification provisions for peace agreements.",
      capabilities: [
        "Treaty clause analysis",
        "Implementation sequencing",
        "Verification design",
        "Ratification pathway review",
      ],
      status: "Available",
    },
  ]),
  ...agents("Legal & Policy Agents", [
    {
      slug: "ihl-advisor",
      name: "International Humanitarian Law Advisor",
      specialty: "IHL Compliance and Accountability",
      description:
        "Advises on international humanitarian law compliance, civilian protection, and accountability mechanisms.",
      capabilities: [
        "IHL compliance review",
        "Civilian protection analysis",
        "Accountability mapping",
        "Legal brief drafting",
      ],
      status: "Available",
    },
    {
      slug: "sanctions-policy-analyst",
      name: "Sanctions Policy Analyst",
      specialty: "Targeted Sanctions and Humanitarian Exemptions",
      description:
        "Evaluates sanctions regimes, humanitarian carve-outs, and unintended economic impacts on civilian populations.",
      capabilities: [
        "Sanctions impact analysis",
        "Humanitarian exemption review",
        "Compliance guidance",
        "Policy option comparison",
      ],
      status: "Offline",
    },
    {
      slug: "transitional-justice-specialist",
      name: "Transitional Justice Specialist",
      specialty: "Truth, Reparations, and Institutional Reform",
      description:
        "Designs transitional justice pathways balancing accountability, reconciliation, and institutional reform.",
      capabilities: [
        "TJ mechanism design",
        "Reparations framework analysis",
        "Institutional reform mapping",
        "Victim-centered policy briefs",
      ],
      status: "Available",
    },
    {
      slug: "constitutional-reform-advisor",
      name: "Constitutional Reform Advisor",
      specialty: "Power-Sharing and Governance Design",
      description:
        "Supports constitutional and governance reforms that enable inclusive power-sharing and durable peace.",
      capabilities: [
        "Constitutional option analysis",
        "Power-sharing design",
        "Electoral system review",
        "Implementation risk assessment",
      ],
      status: "Available",
    },
  ]),
  ...agents("Research & Writing Agents", [
    {
      slug: "policy-brief-writer",
      name: "Policy Brief Writer",
      specialty: "Executive Policy Communication",
      description:
        "Produces concise, decision-ready policy briefs for senior leaders and diplomatic audiences.",
      capabilities: [
        "Policy brief drafting",
        "Executive summary writing",
        "Talking points development",
        "Citation management",
      ],
      status: "Available",
    },
    {
      slug: "literature-synthesis-specialist",
      name: "Literature Synthesis Specialist",
      specialty: "Systematic Review and Evidence Synthesis",
      description:
        "Conducts structured literature reviews and synthesizes evidence across peace, security, and governance domains.",
      capabilities: [
        "Systematic literature review",
        "Evidence tables",
        "Gap analysis",
        "Annotated bibliographies",
      ],
      status: "Available",
    },
    {
      slug: "executive-briefing-editor",
      name: "Executive Briefing Editor",
      specialty: "Strategic Narrative and Clarity",
      description:
        "Refines complex analytical outputs into clear executive briefings aligned with institutional voice.",
      capabilities: [
        "Editorial refinement",
        "Narrative structuring",
        "Audience tailoring",
        "Quality assurance",
      ],
      status: "Offline",
    },
    {
      slug: "academic-publication-advisor",
      name: "Academic Publication Advisor",
      specialty: "Peer-Review and Journal Strategy",
      description:
        "Supports academic publication strategy, peer-review readiness, and scholarly argument development.",
      capabilities: [
        "Manuscript structuring",
        "Peer-review preparation",
        "Journal targeting",
        "Argument strengthening",
      ],
      status: "Available",
    },
  ]),
  ...agents("Strategic Foresight Agents", [
    {
      slug: "scenario-planning-analyst",
      name: "Scenario Planning Analyst",
      specialty: "Alternative Futures and Wargaming",
      description:
        "Develops scenario sets, signposts, and strategic options for uncertain conflict and geopolitical environments.",
      capabilities: [
        "Scenario development",
        "Signpost identification",
        "Wargame design support",
        "Options analysis",
      ],
      status: "Available",
    },
    {
      slug: "geopolitical-risk-forecaster",
      name: "Geopolitical Risk Forecaster",
      specialty: "Risk Horizons and Early Warning",
      description:
        "Forecasts geopolitical risk trajectories and early-warning indicators for prevention and response planning.",
      capabilities: [
        "Risk horizon scanning",
        "Early warning indicators",
        "Trend analysis",
        "Risk brief drafting",
      ],
      status: "Available",
    },
    {
      slug: "emerging-threats-specialist",
      name: "Emerging Threats Specialist",
      specialty: "Technology and Hybrid Threats",
      description:
        "Tracks emerging threats including hybrid warfare, cyber operations, and technology-driven instability.",
      capabilities: [
        "Threat landscape mapping",
        "Hybrid warfare analysis",
        "Technology risk assessment",
        "Mitigation option drafting",
      ],
      status: "Offline",
    },
    {
      slug: "long-range-peace-architect",
      name: "Long-Range Peace Architect",
      specialty: "Generational Peace Strategies",
      description:
        "Designs long-horizon peace architectures linking institutions, economics, and human dignity across generations.",
      capabilities: [
        "Long-range strategy design",
        "Institutional pathway mapping",
        "Generational impact analysis",
        "Peace architecture briefs",
      ],
      status: "Available",
    },
  ]),
  ...agents("Data & Evidence Agents", [
    {
      slug: "conflict-data-analyst",
      name: "Conflict Data Analyst",
      specialty: "Conflict Event Data and Trends",
      description:
        "Analyzes conflict event datasets, trend dynamics, and spatial patterns to inform prevention and response.",
      capabilities: [
        "Event data analysis",
        "Trend visualization support",
        "Spatial pattern review",
        "Data quality assessment",
      ],
      status: "Available",
    },
    {
      slug: "impact-evaluation-specialist",
      name: "Impact Evaluation Specialist",
      specialty: "Program Evaluation and M&E",
      description:
        "Designs impact evaluations and monitoring frameworks for peace programs and diplomatic initiatives.",
      capabilities: [
        "M&E framework design",
        "Impact evaluation planning",
        "Indicator validation",
        "Results reporting",
      ],
      status: "Available",
    },
    {
      slug: "open-source-intelligence-analyst",
      name: "Open-Source Intelligence Analyst",
      specialty: "OSINT and Situational Awareness",
      description:
        "Synthesizes open-source information for situational awareness while maintaining verification standards.",
      capabilities: [
        "OSINT collection protocols",
        "Source verification",
        "Situational briefs",
        "Disinformation flagging",
      ],
      status: "Offline",
    },
    {
      slug: "evidence-mapping-coordinator",
      name: "Evidence Mapping Coordinator",
      specialty: "Evidence Gaps and Research Priorities",
      description:
        "Maps evidence landscapes, identifies research gaps, and coordinates multi-agent evidence synthesis.",
      capabilities: [
        "Evidence gap mapping",
        "Research priority setting",
        "Cross-agent synthesis",
        "Evidence brief coordination",
      ],
      status: "Available",
    },
  ]),
];

export const SHOWCASE_AGENTS = AGENTS;

export function getAgentBySlug(slug: string): Agent | undefined {
  return AGENTS.find((a) => a.slug === slug);
}

export const getShowcaseAgentBySlug = getAgentBySlug;

export function getAgentsByCategory(category: AgentCategory): Agent[] {
  return AGENTS.filter((a) => a.category === category);
}

export const AVAILABLE_AGENT_COUNT = AGENTS.filter(
  (a) => a.status === "Available",
).length;

export const ACTIVE_AGENT_COUNT = AVAILABLE_AGENT_COUNT;
