export type FigureSourceType = "text" | "pdf" | "notes";

export type FigureKnowledgeProfile = {
  id: string;
  name: string;
  years: string;
  role: string;
  expertiseTags: string[];
  biography: string;
  keyIdeas: string[];
  majorEvents: string[];
  quotes: string[];
  sources: FigureSource[];
};

export type FigureChunk = {
  id: string;
  figureId: string;
  content: string;
  sourceName: string;
  sourceType: FigureSourceType;
  metadata?: Record<string, string>;
};

export type FigureSource = {
  id: string;
  figureId: string;
  name: string;
  type: FigureSourceType;
  rawText?: string;
  fileName?: string;
  createdAt: string;
};

export type FigureCitation = {
  sourceName: string;
  snippet: string;
  sourceId?: string;
};

export type RetrievedFigureContext = {
  chunks: FigureChunk[];
  citations: FigureCitation[];
  promptSection: string;
};

/** Persisted chunk row (embedding stored as JSON array) */
export type StoredFigureChunk = FigureChunk & {
  sourceId: string;
  embedding: number[];
  createdAt: string;
};

export type FigureRagStore = {
  sources: FigureSource[];
  chunks: StoredFigureChunk[];
};
