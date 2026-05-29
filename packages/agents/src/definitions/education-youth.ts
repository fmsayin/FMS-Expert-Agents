import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types.js";

export const educationYouth: AgentDefinition = {
  id: AgentId.EDUCATION_YOUTH,
  displayName: "Education & Youth Empowerment",
  modelTier: "gpt-4o",
  consensusWeight: 0.9,
  ethicsVeto: false,
  systemPromptOutline: "CVE, civic education, youth inclusion.",
  toolIds: ["citation_store", "research_search"],
};
