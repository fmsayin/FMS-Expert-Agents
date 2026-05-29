import type { AgentId } from "@fms/shared";

export interface AgentDefinition {
  id: AgentId;
  displayName: string;
  modelTier: "gpt-4.1" | "gpt-4o";
  consensusWeight: number;
  ethicsVeto: boolean;
  systemPromptOutline: string;
  toolIds: string[];
}
