import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types.js";

export const economicDev: AgentDefinition = {
  id: AgentId.ECONOMIC_DEV,
  displayName: "Economic Development",
  modelTier: "gpt-4o",
  consensusWeight: 0.9,
  ethicsVeto: false,
  systemPromptOutline: "Inclusive growth, sanctions relief, economic peacebuilding.",
  toolIds: ["scenario_matrix", "citation_store", "research_search"],
};
