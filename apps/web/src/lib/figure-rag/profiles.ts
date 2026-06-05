import type { HistoricalFigure } from "@/data/historical-figures";
import {
  getHistoricalFigureById,
  HISTORICAL_FIGURES,
} from "@/data/historical-figures";
import type { FigureKnowledgeProfile } from "@/lib/figure-rag/types";
import { listFigureSources } from "@/lib/figure-rag/store";

/** Built-in round-table figure ids (synced from historical-figures.ts). */
export const BUILT_IN_FIGURE_IDS: readonly string[] = HISTORICAL_FIGURES.map(
  (f) => f.id,
);

export function isBuiltInFigureId(figureId: string): boolean {
  return getHistoricalFigureById(figureId) !== undefined;
}

/** Metadata profile for a figure (built-in style + uploaded source list). */
export function getFigureKnowledgeProfile(figureId: string): FigureKnowledgeProfile | null {
  const figure = getHistoricalFigureById(figureId);
  if (!figure) return null;

  const { sources } = listFigureSources(figureId);

  return {
    id: figure.id,
    name: figure.name,
    years: figure.era,
    role: figure.role,
    expertiseTags: figure.expertiseTags,
    biography: figure.style,
    keyIdeas: figure.expertiseTags,
    majorEvents: [],
    quotes: [],
    sources,
  };
}

export function historicalFigureToProfile(figure: HistoricalFigure): FigureKnowledgeProfile {
  const { sources } = listFigureSources(figure.id);
  return {
    id: figure.id,
    name: figure.name,
    years: figure.era,
    role: figure.role,
    expertiseTags: figure.expertiseTags,
    biography: figure.style,
    keyIdeas: figure.expertiseTags,
    majorEvents: [],
    quotes: [],
    sources,
  };
}
