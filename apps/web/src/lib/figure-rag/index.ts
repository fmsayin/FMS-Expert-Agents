export type {
  FigureChunk,
  FigureCitation,
  FigureKnowledgeProfile,
  FigureSource,
  FigureSourceType,
  RetrievedFigureContext,
} from "@/lib/figure-rag/types";

export { chunkText } from "@/lib/figure-rag/chunking";
export { getOpenAIEmbedding, getOpenAIEmbeddings } from "@/lib/figure-rag/embeddings";
export { ingestFigureText } from "@/lib/figure-rag/ingest";
export { getFigureKnowledgeProfile, historicalFigureToProfile } from "@/lib/figure-rag/profiles";
export {
  buildFigureRetrievalQuery,
  retrieveFigureContext,
} from "@/lib/figure-rag/retrieve";
export { deleteFigureSource, listFigureSources } from "@/lib/figure-rag/store";
export { getFigureRagDataDir } from "@/lib/figure-rag/paths";
