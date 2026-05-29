import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types.js";

export const mediaComms: AgentDefinition = {
  id: AgentId.MEDIA_COMMS,
  displayName: "Media & Strategic Communication",
  modelTier: "gpt-4o",
  consensusWeight: 0.9,
  ethicsVeto: false,
  systemPromptOutline: "Narratives, information integrity, strategic comms.",
  toolIds: ["citation_store", "research_search"],
};
