import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content", "research");

/** Strip YAML frontmatter and duplicate header/abstract blocks shown in the page UI. */
export function prepareArticleMarkdown(raw: string): string {
  let content = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  content = content.replace(
    /^#\s+[^\n]+\n+(?:\*\*Author:\*\*[^\n]+\n+(?:\*\*Affiliation:\*\*[^\n]+\n+)?)?---\n+/m,
    "",
  );
  content = content.replace(/## Abstract\s+[\s\S]*?(?=\n---\n)/, "");
  content = content.replace(/^\s*---\s*\n+/m, "");
  return content.trim();
}

export async function loadArticleMarkdown(contentSlug: string): Promise<string> {
  const filePath = path.join(CONTENT_DIR, `${contentSlug}.md`);
  const raw = await fs.readFile(filePath, "utf-8");
  return prepareArticleMarkdown(raw);
}

export function extractAbstract(markdown: string): string | null {
  const match = markdown.match(/## Abstract\s+([\s\S]*?)(?=\n---|\n## )/);
  if (!match) return null;
  return match[1]
    .replace(/\*\*([^*]+):\*\*/g, "$1:")
    .replace(/\n+/g, " ")
    .trim();
}
