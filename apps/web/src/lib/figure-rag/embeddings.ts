import "server-only";

import { getOpenAIApiKey } from "@/lib/load-secrets";

const EMBEDDING_MODEL = "text-embedding-3-small";

export async function getOpenAIEmbedding(text: string): Promise<number[]> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000),
    }),
  });

  const data = (await res.json()) as {
    data?: { embedding?: number[] }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? "OpenAI embeddings error");
  }

  const embedding = data.data?.[0]?.embedding;
  if (!embedding?.length) {
    throw new Error("Empty embedding from OpenAI");
  }

  return embedding;
}

export async function getOpenAIEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (texts.length === 1) {
    return [await getOpenAIEmbedding(texts[0]!)];
  }

  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts.map((t) => t.slice(0, 8000)),
    }),
  });

  const data = (await res.json()) as {
    data?: { index: number; embedding: number[] }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? "OpenAI embeddings error");
  }

  const rows = data.data ?? [];
  const sorted = [...rows].sort((a, b) => a.index - b.index);
  return sorted.map((row) => row.embedding);
}
