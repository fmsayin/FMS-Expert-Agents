import { z } from "zod";
import type { AgentId } from "@fms/shared";

export const challengeRecordSchema = z.object({
  targetClaimId: z.string(),
  severity: z.enum(["low", "medium", "high", "blocking"]),
  challengeType: z.enum(["assumption", "risk", "evidence", "ethics"]),
  resolution: z.string().optional(),
  content: z.string(),
  challengerAgentId: z.string(),
});

/** Risk & challenge pass output. */
export interface ChallengeRecord {
  challengerAgentId: AgentId;
  targetClaimId: string;
  challengeType: "assumption" | "risk" | "evidence" | "ethics";
  content: string;
  severity: "low" | "medium" | "high" | "blocking";
  resolution?: string;
}

export function parseChallengeRecord(
  raw: unknown,
  challengerAgentId: AgentId,
): ChallengeRecord {
  const parsed = challengeRecordSchema.parse({
    ...(raw as object),
    challengerAgentId,
  });
  return {
    ...parsed,
    challengerAgentId: parsed.challengerAgentId as AgentId,
  };
}
