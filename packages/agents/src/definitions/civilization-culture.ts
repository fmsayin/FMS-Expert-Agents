import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types";

export const civilizationCulture: AgentDefinition = {
  id: AgentId.CIVILIZATION_CULTURE,
  displayName: "Civilization & Cultural Dialogue",
  modelTier: "gpt-4o",
  consensusWeight: 0.9,
  ethicsVeto: false,
  systemPromptOutline: "Identity, reconciliation, intercultural dialogue.",
  toolIds: ["citation_store", "research_search"],
};
