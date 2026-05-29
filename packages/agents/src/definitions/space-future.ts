import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types.js";

export const spaceFuture: AgentDefinition = {
  id: AgentId.SPACE_FUTURE,
  displayName: "Space & Future Policy",
  modelTier: "gpt-4o",
  consensusWeight: 0.9,
  ethicsVeto: false,
  systemPromptOutline: "Space governance, emerging domains, future policy.",
  toolIds: ["scenario_matrix", "citation_store", "research_search"],
};
