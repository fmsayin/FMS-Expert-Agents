import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const OPENAI_ENV_REL = join("..", "..", "secrets", "openai.env");

type OpenAiEnvFile = { apiKey?: string; model?: string };

let cachedOpenAiEnv: OpenAiEnvFile | null | undefined;

function parseOpenAiEnvFile(contents: string): OpenAiEnvFile {
  const result: OpenAiEnvFile = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const keyMatch = trimmed.match(/^OPENAI_API_KEY\s*=\s*(.+)$/);
    if (keyMatch?.[1]) {
      const value = keyMatch[1].trim().replace(/^["']|["']$/g, "");
      if (value) result.apiKey = value;
      continue;
    }
    const modelMatch = trimmed.match(/^OPENAI_MODEL\s*=\s*(.+)$/);
    if (modelMatch?.[1]) {
      const value = modelMatch[1].trim().replace(/^["']|["']$/g, "");
      if (value) result.model = value;
    }
  }
  return result;
}

function loadOpenAiEnvFile(): OpenAiEnvFile {
  if (cachedOpenAiEnv !== undefined) {
    return cachedOpenAiEnv ?? {};
  }
  try {
    const envPath = join(process.cwd(), OPENAI_ENV_REL);
    const contents = readFileSync(envPath, "utf8");
    cachedOpenAiEnv = parseOpenAiEnvFile(contents);
    return cachedOpenAiEnv;
  } catch {
    cachedOpenAiEnv = null;
    return {};
  }
}

/**
 * Resolves OpenAI API key from process.env or repo-root secrets/openai.env.
 * Server-only — never import from client components.
 */
export function getOpenAIApiKey(): string | undefined {
  if (process.env.OPENAI_API_KEY?.trim()) {
    return process.env.OPENAI_API_KEY.trim();
  }
  return loadOpenAiEnvFile().apiKey;
}

export function getOpenAIModel(): string {
  if (process.env.OPENAI_MODEL?.trim()) {
    return process.env.OPENAI_MODEL.trim();
  }
  return loadOpenAiEnvFile().model || "gpt-4o-mini";
}

/** OpenAI text-embedding-3-small — server-only; requires API key. */
export { getOpenAIEmbedding, getOpenAIEmbeddings } from "@/lib/figure-rag/embeddings";
