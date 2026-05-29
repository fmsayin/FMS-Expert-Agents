import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types.js";

export const humanitarian: AgentDefinition = {
  id: AgentId.HUMANITARIAN,
  displayName: "Humanitarian Affairs",
  modelTier: "gpt-4.1",
  consensusWeight: 1.1,
  ethicsVeto: false,
  systemPromptOutline: "Protection, aid, IHL compliance.",
  toolIds: ["risk_register", "citation_store", "research_search"],
};
