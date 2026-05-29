import { z } from "zod";
import type { AgentId } from "@fms/shared";

export const findingSchema = z.object({
  id: z.string(),
  text: z.string(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

export const recommendationSchema = z.object({
  id: z.string(),
  text: z.string(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export const riskSchema = z.object({
  id: z.string(),
  description: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

export const analysisArtifactSchema = z.object({
  agentId: z.string(),
  executiveSummary: z.string(),
  keyFindings: z.array(findingSchema),
  recommendations: z.array(recommendationSchema),
  risks: z.array(riskSchema),
  assumptions: z.array(z.string()),
  questionsForDebate: z.array(z.string()),
  citations: z.array(z.string()),
  domainExtensions: z.record(z.unknown()).optional(),
});

export type Finding = z.infer<typeof findingSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type Risk = z.infer<typeof riskSchema>;

/** Structured output from phase-1 independent analysis. */
export interface AnalysisArtifact {
  agentId: AgentId;
  executiveSummary: string;
  keyFindings: Finding[];
  recommendations: Recommendation[];
  risks: Risk[];
  assumptions: string[];
  questionsForDebate: string[];
  citations: string[];
  domainExtensions?: Record<string, unknown>;
  usage?: { prompt: number; completion: number };
}

export function parseAnalysisArtifact(raw: unknown): AnalysisArtifact {
  const parsed = analysisArtifactSchema.parse(raw);
  return {
    ...parsed,
    agentId: parsed.agentId as AgentId,
  };
}
