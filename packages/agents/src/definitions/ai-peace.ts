import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types.js";

export const aiPeace: AgentDefinition = {
  id: AgentId.AI_PEACE,
  displayName: "AI for Peace",
  modelTier: "gpt-4o",
  consensusWeight: 0.9,
  ethicsVeto: false,
  systemPromptOutline: "Tech ethics, dual-use, peace technology.",
  toolIds: ["citation_store", "research_search"],
};
