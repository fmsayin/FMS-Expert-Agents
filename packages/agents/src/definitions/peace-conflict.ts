import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types.js";

export const peaceConflict: AgentDefinition = {
  id: AgentId.PEACE_CONFLICT,
  displayName: "Peace & Conflict Resolution",
  modelTier: "gpt-4.1",
  consensusWeight: 1.0,
  ethicsVeto: false,
  systemPromptOutline: "Mediation, ceasefires, DDR, peace processes.",
  toolIds: ["claim_graph", "citation_store", "research_search"],
};
