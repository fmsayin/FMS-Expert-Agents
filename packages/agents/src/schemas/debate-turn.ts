import { z } from "zod";
import type { AgentId } from "@fms/shared";

export const debateTurnSchema = z.object({
  agentId: z.string(),
  round: z.number().int().positive(),
  content: z.string(),
  claimsAddressed: z.array(z.string()),
  stance: z.enum(["support", "oppose", "nuance", "clarify"]),
  newClaims: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
  references: z.array(z.string()).optional(),
});

/** One agent utterance in a structured debate round. */
export interface DebateTurn {
  agentId: AgentId;
  round: number;
  content: string;
  claimsAddressed: string[];
  stance: "support" | "oppose" | "nuance" | "clarify";
  newClaims: { id: string; text: string }[];
  references?: string[];
}

export function parseDebateTurn(raw: unknown, round: number): DebateTurn {
  const parsed = debateTurnSchema.parse({ ...(raw as object), round });
  return {
    ...parsed,
    agentId: parsed.agentId as AgentId,
    round,
  };
}
