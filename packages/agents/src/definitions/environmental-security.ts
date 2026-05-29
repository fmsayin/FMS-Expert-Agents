import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types.js";

export const environmentalSecurity: AgentDefinition = {
  id: AgentId.ENVIRONMENTAL_SECURITY,
  displayName: "Environmental Security",
  modelTier: "gpt-4o",
  consensusWeight: 0.9,
  ethicsVeto: false,
  systemPromptOutline: "Climate-conflict nexus, environmental peacebuilding.",
  toolIds: ["risk_register", "citation_store", "research_search"],
};
