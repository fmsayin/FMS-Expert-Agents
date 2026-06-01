import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types";

export const strategicSecurity: AgentDefinition = {
  id: AgentId.STRATEGIC_SECURITY,
  displayName: "Strategic & Security Studies",
  modelTier: "gpt-4.1",
  consensusWeight: 1.0,
  ethicsVeto: false,
  systemPromptOutline: "Deterrence, stability, threat assessment.",
  toolIds: ["risk_register", "scenario_matrix", "research_search"],
};
