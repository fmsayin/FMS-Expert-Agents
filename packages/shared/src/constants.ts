/** Agent identifiers (DB/API slug format). */
export const AgentId = {
  CHIEF_PEACE_ARCHITECT: "chief_peace_architect",
  PEACE_CONFLICT: "peace_conflict",
  DIPLOMACY_IR: "diplomacy_ir",
  STRATEGIC_SECURITY: "strategic_security",
  HUMANITARIAN: "humanitarian",
  AI_PEACE: "ai_peace",
  ECONOMIC_DEV: "economic_dev",
  CIVILIZATION_CULTURE: "civilization_culture",
  EDUCATION_YOUTH: "education_youth",
  MEDIA_COMMS: "media_comms",
  ENVIRONMENTAL_SECURITY: "environmental_security",
  SPACE_FUTURE: "space_future",
  ETHICS_RIGHTS: "ethics_rights",
} as const;

export type AgentId = (typeof AgentId)[keyof typeof AgentId];

export const ALL_AGENT_IDS: readonly AgentId[] = Object.values(AgentId);

/** LangGraph / session phase identifiers. */
export const SessionPhase = {
  QUEUED: "queued",
  ANALYSIS: "analysis",
  DEBATE: "debate",
  CHALLENGE: "challenge",
  CONSENSUS: "consensus",
  REPORT: "report",
  COMPLETE: "complete",
  FAILED: "failed",
} as const;

export type SessionPhase = (typeof SessionPhase)[keyof typeof SessionPhase];
