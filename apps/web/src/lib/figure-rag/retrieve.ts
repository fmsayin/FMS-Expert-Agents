import "server-only";

import { getOpenAIEmbedding } from "@/lib/figure-rag/embeddings";
import { cosineSimilarity } from "@/lib/figure-rag/cosine";
import { getFigureChunks } from "@/lib/figure-rag/store";
import type {
  FigureChunk,
  FigureCitation,
  RetrievedFigureContext,
} from "@/lib/figure-rag/types";

const SNIPPET_MAX = 180;

function truncateSnippet(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= SNIPPET_MAX) return t;
  return `${t.slice(0, SNIPPET_MAX - 1)}…`;
}

function buildPromptSection(chunks: FigureChunk[]): string {
  const blocks = chunks.map(
    (c, i) =>
      `[${i + 1}] Source: ${c.sourceName} (${c.sourceType})\n${c.content}`,
  );
  return `

Retrieved knowledge for this figure (cite sources by name when you use them):
${blocks.join("\n\n")}

Ground claims in the retrieved passages when relevant. If retrieved text conflicts with your historical persona, prefer retrieved sources for factual claims and your persona for voice and judgment.`;
}

/**
 * Retrieve top-K chunks by cosine similarity to the query embedding.
 * Returns empty prompt section when no chunks exist (caller uses profile-only prompt).
 */
export async function retrieveFigureContext(
  figureId: string,
  query: string,
  topK = 5,
): Promise<RetrievedFigureContext> {
  const stored = getFigureChunks(figureId);
  if (stored.length === 0) {
    return { chunks: [], citations: [], promptSection: "" };
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { chunks: [], citations: [], promptSection: "" };
  }

  let queryEmbedding: number[];
  try {
    queryEmbedding = await getOpenAIEmbedding(trimmedQuery);
  } catch {
    return { chunks: [], citations: [], promptSection: "" };
  }

  const k = Math.min(Math.max(topK, 3), 5);
  const ranked = stored
    .map((row) => ({
      row,
      score: cosineSimilarity(queryEmbedding, row.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  const chunks: FigureChunk[] = ranked.map(({ row }) => ({
    id: row.id,
    figureId: row.figureId,
    content: row.content,
    sourceName: row.sourceName,
    sourceType: row.sourceType,
  }));

  const citations: FigureCitation[] = ranked.map(({ row }) => ({
    sourceName: row.sourceName,
    snippet: truncateSnippet(row.content),
    sourceId: row.sourceId,
  }));

  return {
    chunks,
    citations,
    promptSection: buildPromptSection(chunks),
  };
}

export function buildFigureRetrievalQuery(
  topicFull: string,
  messages: { role: string; content: string }[],
  mode?: string,
): string {
  const recent = messages
    .slice(-4)
    .map((m) => m.content.trim())
    .filter(Boolean)
    .join("\n");
  const parts = [topicFull, recent, mode].filter(Boolean);
  return parts.join("\n\n");
}
