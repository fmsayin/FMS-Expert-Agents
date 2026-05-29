import type { ReportGenerator, ReportGeneratorInput, StrategicPeaceReport, SprrSection } from "./types.js";

const SPRR_SECTION_ORDER: Array<{ id: string; title: string; agents: string[] }> = [
  { id: "executive", title: "Executive Summary", agents: ["chief_peace_architect"] },
  {
    id: "conflict-dynamics",
    title: "Conflict & Peace Dynamics",
    agents: ["peace_conflict", "strategic_security"],
  },
  { id: "diplomatic", title: "Diplomatic Pathways", agents: ["diplomacy_ir"] },
  {
    id: "humanitarian",
    title: "Humanitarian & Protection",
    agents: ["humanitarian", "ethics_rights"],
  },
  {
    id: "economic-environmental",
    title: "Economic & Environmental Foundations",
    agents: ["economic_dev", "environmental_security"],
  },
  {
    id: "society-culture",
    title: "Society, Culture & Youth",
    agents: ["civilization_culture", "education_youth"],
  },
  {
    id: "technology-media",
    title: "Technology, Media & Space",
    agents: ["ai_peace", "media_comms", "space_future"],
  },
  {
    id: "strategic-recommendations",
    title: "Strategic Recommendations & Phasing",
    agents: ["chief_peace_architect"],
  },
  { id: "metrics", title: "Metrics & Review", agents: ["*"] },
  { id: "dissent-ethics", title: "Dissent & Ethics Appendix", agents: ["ethics_rights"] },
];

/** Template-based SPRR generator stub; orchestrator may enrich via Chief LLM. */
export function createReportGenerator(): ReportGenerator {
  return {
    generate(input: ReportGeneratorInput): StrategicPeaceReport {
      const { sessionId, topic, consensus } = input;
      const generatedAt = new Date().toISOString();

      const sections: SprrSection[] = SPRR_SECTION_ORDER.map((spec) => ({
        id: spec.id,
        title: spec.title,
        content: buildSectionContent(spec.id, topic, consensus),
        contributingAgents:
          spec.agents[0] === "*"
            ? (["chief_peace_architect"] as SprrSection["contributingAgents"])
            : (spec.agents as SprrSection["contributingAgents"]),
      }));

      return {
        title: `Strategic Peace Recommendation Report: ${topic}`,
        sessionId,
        generatedAt,
        executiveSummary: consensus.recommendationSummary,
        sections,
        dissentAppendix: consensus.dissent,
        indicatorsOfProgress: [
          {
            id: "de-escalation",
            label: "Verifiable de-escalation milestones",
            target: "Defined within 90 days",
          },
          {
            id: "protection",
            label: "Civilian protection outcomes",
            target: "Measurable access improvements",
          },
        ],
        risksAndMitigations: consensus.strategicPillars.map((p, i) => ({
          id: `risk-${i + 1}`,
          description: `Implementation risk: ${p.title}`,
          mitigation: p.description.slice(0, 200),
          severity: "medium" as const,
        })),
      };
    },
  };
}

function buildSectionContent(
  sectionId: string,
  topic: string,
  consensus: ReportGeneratorInput["consensus"],
): string {
  switch (sectionId) {
    case "executive":
      return consensus.recommendationSummary;
    case "strategic-recommendations":
      return consensus.phasedActions
        .map((p) => `**${p.phase}** (${p.timeframe ?? "TBD"}): ${p.actions.join("; ")}`)
        .join("\n\n");
    default:
      return `Analysis and recommendations for **${topic}** in the ${sectionId.replace(/-/g, " ")} domain, aligned with consensus pillars: ${consensus.strategicPillars.map((p) => p.title).join(", ")}.`;
  }
}
