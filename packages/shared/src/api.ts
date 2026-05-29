import { z } from "zod";

/** Standard API error envelope (docs/architecture/06-api-design.md). */
export const ApiErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  GRAPH_UNAVAILABLE: "GRAPH_UNAVAILABLE",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export const SessionContextSchema = z.object({
  region: z.string().optional(),
  actors: z.array(z.string()).optional(),
  timeHorizon: z.string().optional(),
  constraints: z.array(z.string()).optional(),
});

export type SessionContext = z.infer<typeof SessionContextSchema>;

export const CreateSessionConfigSchema = z.object({
  debateRounds: z.number().int().min(1).max(5).default(2),
  startImmediately: z.boolean().default(false),
  allowPartialAnalysis: z.boolean().default(false),
  selectedAgentIds: z.array(z.string()).optional(),
});

export type CreateSessionConfig = z.infer<typeof CreateSessionConfigSchema>;

export const CreateSessionBodySchema = z.object({
  title: z.string().min(3).max(200),
  topic: z.string().min(20).max(5000),
  context: SessionContextSchema.default({}),
  config: CreateSessionConfigSchema.default({}),
});

export type CreateSessionBody = z.infer<typeof CreateSessionBodySchema>;

export const ListSessionsQuerySchema = z.object({
  status: z
    .enum([
      "draft",
      "queued",
      "running",
      "paused",
      "completed",
      "failed",
      "cancelled",
      "all",
    ])
    .default("all"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type ListSessionsQuery = z.infer<typeof ListSessionsQuerySchema>;

export const PatchSessionBodySchema = z.object({
  action: z.enum(["cancel"]),
  reviewNote: z.string().optional(),
});

export type PatchSessionBody = z.infer<typeof PatchSessionBodySchema>;

export const RunSessionBodySchema = z.object({
  action: z.enum(["start", "approve", "reject"]).default("start"),
  reviewNote: z.string().optional(),
});

export type RunSessionBody = z.infer<typeof RunSessionBodySchema>;

export const ExportReportBodySchema = z.object({
  format: z.enum(["pdf", "markdown"]).default("pdf"),
});

export type ExportReportBody = z.infer<typeof ExportReportBodySchema>;

export const DebateQuerySchema = z.object({
  round: z.coerce.number().int().min(1).optional(),
});

/** SSE event types from architecture doc §4.8 */
export const SseEventType = {
  PHASE_CHANGE: "phase_change",
  ANALYSIS_PROGRESS: "analysis_progress",
  DEBATE_TURN: "debate_turn",
  CHALLENGE_FINDING: "challenge_finding",
  CONSENSUS_UPDATE: "consensus_update",
  REPORT_SECTION: "report_section",
  ERROR: "error",
  COMPLETE: "complete",
} as const;

export type SseEventType = (typeof SseEventType)[keyof typeof SseEventType];

export interface SessionSummary {
  id: string;
  title: string;
  topic: string;
  status: string;
  phase: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface SessionDetail extends SessionSummary {
  context: SessionContext;
  debateRoundCurrent: number;
  debateRoundsConfig: number;
  tokensUsed: number;
  tokenBudget: number;
  runId?: string | null;
  startedAt?: string | null;
  errorMessage?: string | null;
}
