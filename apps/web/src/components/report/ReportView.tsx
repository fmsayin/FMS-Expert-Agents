import ReactMarkdown from "react-markdown";
import type { SessionReport } from "@/lib/api-client";

export function ReportView({ report }: { report: SessionReport | null }) {
  if (!report?.markdown) {
    return (
      <p className="text-sm text-muted-foreground">
        The Strategic Peace Recommendation Report (SPRR) will appear here when the report
        phase completes.
      </p>
    );
  }

  return (
    <article className="prose prose-slate max-w-none font-serif text-foreground prose-headings:font-sans prose-a:text-primary">
      <ReactMarkdown>{report.markdown}</ReactMarkdown>
    </article>
  );
}
