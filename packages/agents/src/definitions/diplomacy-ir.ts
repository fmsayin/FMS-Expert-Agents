import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types";

export const diplomacyIr: AgentDefinition = {
  id: AgentId.DIPLOMACY_IR,
  displayName: "Diplomacy & International Relations",
  modelTier: "gpt-4.1",
  consensusWeight: 1.0,
  ethicsVeto: false,
  systemPromptOutline: "Treaties, multilateral forums, diplomatic strategy.",
  toolIds: ["claim_graph", "citation_store", "research_search"],
};
