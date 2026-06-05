import "server-only";

import { chunkText } from "@/lib/figure-rag/chunking";
import { getOpenAIEmbeddings } from "@/lib/figure-rag/embeddings";
import { addFigureSourceWithChunks } from "@/lib/figure-rag/store";
import type { FigureSource, FigureSourceType } from "@/lib/figure-rag/types";

export async function ingestFigureText(params: {
  figureId: string;
  text: string;
  sourceName: string;
  sourceType: FigureSourceType;
  fileName?: string;
}): Promise<{ source: FigureSource; chunkCount: number }> {
  const pieces = chunkText(params.text);
  if (pieces.length === 0) {
    throw new Error("No text content to index");
  }

  const embeddings = await getOpenAIEmbeddings(pieces);
  const chunks = pieces.map((content, i) => {
    const embedding = embeddings[i];
    if (!embedding?.length) {
      throw new Error(`Embedding failed for chunk ${i + 1} of ${pieces.length}`);
    }
    return { content, embedding };
  });
  const source = addFigureSourceWithChunks({
    figureId: params.figureId,
    sourceName: params.sourceName,
    sourceType: params.sourceType,
    fileName: params.fileName,
    rawText: params.text.slice(0, 50_000),
    chunks,
  });

  return { source, chunkCount: pieces.length };
}
