import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types";

export const chiefPeaceArchitect: AgentDefinition = {
  id: AgentId.CHIEF_PEACE_ARCHITECT,
  displayName: "Chief Peace Architect",
  modelTier: "gpt-4.1",
  consensusWeight: 1.2,
  ethicsVeto: false,
  systemPromptOutline: "Integrative strategist; chairs synthesis across domains.",
  toolIds: ["claim_graph", "citation_store", "research_search"],
};
