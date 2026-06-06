import "server-only";

import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

import { getFigureRagStorePath } from "@/lib/figure-rag/paths";
import type {
  FigureRagStore,
  FigureSource,
  FigureSourceType,
  StoredFigureChunk,
} from "@/lib/figure-rag/types";

function emptyStore(): FigureRagStore {
  return { sources: [], chunks: [] };
}

function readStore(): FigureRagStore {
  const path = getFigureRagStorePath();
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as FigureRagStore;
    return {
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      chunks: Array.isArray(parsed.chunks) ? parsed.chunks : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: FigureRagStore): void {
  const path = getFigureRagStorePath();
  writeFileSync(path, JSON.stringify(store, null, 2), "utf8");
}

export function listFigureSources(figureId: string): {
  sources: FigureSource[];
  chunkCount: number;
} {
  const store = readStore();
  const sources = store.sources.filter((s) => s.figureId === figureId);
  const chunkCount = store.chunks.filter((c) => c.figureId === figureId).length;
  return { sources, chunkCount };
}

export function getFigureChunks(figureId: string): StoredFigureChunk[] {
  return readStore().chunks.filter((c) => c.figureId === figureId);
}

export function addFigureSourceWithChunks(params: {
  figureId: string;
  sourceName: string;
  sourceType: FigureSourceType;
  fileName?: string;
  rawText?: string;
  chunks: { content: string; embedding: number[] }[];
}): FigureSource {
  const store = readStore();
  const now = new Date().toISOString();
  const source: FigureSource = {
    id: randomUUID(),
    figureId: params.figureId,
    name: params.sourceName,
    type: params.sourceType,
    fileName: params.fileName,
    rawText: params.rawText?.slice(0, 50_000),
    createdAt: now,
  };

  store.sources.push(source);

  for (const piece of params.chunks) {
    store.chunks.push({
      id: randomUUID(),
      figureId: params.figureId,
      sourceId: source.id,
      content: piece.content,
      sourceName: params.sourceName,
      sourceType: params.sourceType,
      embedding: piece.embedding,
      createdAt: now,
    });
  }

  writeStore(store);
  return source;
}

export function deleteFigureSource(figureId: string, sourceId: string): boolean {
  const store = readStore();
  const before = store.sources.length;
  store.sources = store.sources.filter(
    (s) => !(s.figureId === figureId && s.id === sourceId),
  );
  store.chunks = store.chunks.filter(
    (c) => !(c.figureId === figureId && c.sourceId === sourceId),
  );
  if (store.sources.length === before) return false;
  writeStore(store);
  return true;
}
