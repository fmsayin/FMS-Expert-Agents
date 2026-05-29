import { GLOBAL_EXPERT_DEBATE_RULES } from "../debate-rules.js";
import type { AgentDefinition } from "../types.js";

/** Builds a full system prompt from an agent definition (stub). */
export function buildSystemPrompt(agent: AgentDefinition): string {
  return [
    `You are ${agent.displayName} for FMS Expert Agents.`,
    agent.systemPromptOutline,
    "",
    GLOBAL_EXPERT_DEBATE_RULES,
  ].join("\n");
}
