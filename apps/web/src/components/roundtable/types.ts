export type RoundTableThemeId = "scholarly" | "dark" | "editorial" | "futuristic";

export type RoundTableCitation = {
  sourceName: string;
  snippet: string;
};

export type RoundTableChatMessage = {
  role: "user" | "assistant";
  content: string;
  figureId?: string;
  figureName?: string;
  initials?: string;
  era?: string;
  citations?: RoundTableCitation[];
};

export type RoundTableChatMode = "debate" | "interjection";

export type RoundTableCustomTopic = {
  title: string;
  description: string;
};

export type TypingFigure = {
  figureId: string;
  name: string;
  initials: string;
};

export type DebateStatus =
  | "idle"
  | "waiting"
  | "in_progress"
  | "consensus_building"
  | "complete";

export type ThinkTankAnalysis = {
  consensus: string;
  disagreements: string;
  risks: string;
  recommendations: string;
  executiveSummary: string;
  consensusScore?: number;
  disagreementScore?: number;
};

/** Ordered sections for Reports / Think Tank Outputs UI */
export const THINK_TANK_REPORT_SECTIONS = [
  { id: "summary", label: "Executive Summary", key: "executiveSummary" },
  { id: "consensus", label: "Consensus", key: "consensus" },
  { id: "disagreements", label: "Disagreements", key: "disagreements" },
  { id: "risks", label: "Risks", key: "risks" },
  { id: "recommendations", label: "Recommendations", key: "recommendations" },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  key: keyof Pick<
    ThinkTankAnalysis,
    "executiveSummary" | "consensus" | "disagreements" | "risks" | "recommendations"
  >;
}>;

export type DebateProgress = {
  current: number;
  total: number;
  figureName: string;
};

/** UI display mode for English debate + Turkish analysis layer */
export type TurkishViewMode = "english_only" | "turkish_only" | "bilingual";

export type TurkishSummaryStructured = {
  anaArguman: string;
  stratejikCikarim: string;
  politikaIliskisi: string;
};

export type TurkishSummaryEntry = {
  id: string;
  timestamp: number;
  figureName: string;
  /** Flat summary text (legacy or combined display) */
  summary: string;
  structured?: TurkishSummaryStructured;
  isLoading?: boolean;
  error?: string;
};

export type RoundtableRightTab = "participants" | "observer" | "reports";

export type TurkishExecutiveReport = {
  yoneticiOzeti: string;
  konsensus: string;
  anlasmazliklar: string;
  riskler: string;
  oneriler: string;
};
