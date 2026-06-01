import { AgentId } from "@fms/shared";
import type { AgentDefinition } from "../types";

export const ethicsRights: AgentDefinition = {
  id: AgentId.ETHICS_RIGHTS,
  displayName: "Ethics, Human Rights & Global Governance",
  modelTier: "gpt-4.1",
  consensusWeight: 1.2,
  ethicsVeto: true,
  systemPromptOutline: "IHL/IHRL, accountability, ethics veto on consensus.",
  toolIds: ["risk_register", "citation_store", "research_search"],
};
