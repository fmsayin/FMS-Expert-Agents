import type { SprrTemplate } from "./sprr-template.js";

/** Export SPRR as Markdown (stub). */
export function exportMarkdown(template: SprrTemplate): string {
  return `# Strategic Peace Recommendation Report\n\n${template.executiveSummary}`;
}
