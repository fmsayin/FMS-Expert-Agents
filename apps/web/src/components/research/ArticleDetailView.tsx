import Link from "next/link";
import { AGENTS } from "@/data/agents";
import type { ResearchOutput } from "@/data/types";
import { ArticleMarkdown } from "@/components/research/ArticleMarkdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleDownloads } from "@/components/research/ArticleDownloads";
import { ChevronRight } from "lucide-react";

type Props = {
  output: ResearchOutput;
  markdown: string;
};

function formatDate(date: string): string {
  const [year, month] = date.split("-");
  if (!month) return year;
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function ArticleDetailView({ output, markdown }: Props) {
  const relatedAgents = (output.relatedAgentSlugs ?? [])
    .map((slug) => AGENTS.find((a) => a.slug === slug))
    .filter(Boolean);

  const abstract = output.abstract ?? "";

  return (
    <div className="print-article mx-auto max-w-6xl space-y-6">
      <nav aria-label="Breadcrumb" className="print:hidden">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/outputs" className="hover:text-primary">
              Research Outputs
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="inline h-4 w-4" />
          </li>
          <li className="line-clamp-1 font-medium text-foreground">{output.title}</li>
        </ol>
      </nav>

      <header className="rounded-xl border border-gold/25 bg-gradient-to-br from-primary via-primary to-primary/90 p-6 text-primary-foreground shadow-lg md:p-10 print:border print:bg-white print:text-black print:shadow-none">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-light print:text-gray-600">
          {output.type}
        </p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight tracking-tight md:text-3xl lg:text-4xl print:text-black">
          {output.title}
        </h1>
        {output.author && (
          <p className="mt-4 text-base font-medium text-primary-foreground/95 print:text-black">
            {output.author}
          </p>
        )}
        {output.affiliation && (
          <p className="mt-1 text-sm text-primary-foreground/80 print:text-gray-700">
            {output.affiliation}
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-8">
          {abstract && (
            <section
              className="rounded-lg border border-gold/30 bg-gold/5 p-5 md:p-6 print:border-gray-300 print:bg-gray-50"
              aria-labelledby="abstract-heading"
            >
              <h2 id="abstract-heading" className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
                Abstract
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">{abstract}</p>
            </section>
          )}

          <div className="mx-auto max-w-3xl">
            <ArticleMarkdown markdown={markdown} />
          </div>
        </div>

        <aside className="space-y-4 print:hidden lg:sticky lg:top-6 lg:self-start">
          <Card className="border-gold/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Publication details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd className="font-medium">{formatDate(output.date)}</dd>
                </div>
                {output.wordCount != null && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Word count</dt>
                    <dd className="font-medium tabular-nums">{output.wordCount.toLocaleString()}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">Type</dt>
                  <dd className="font-medium">{output.type}</dd>
                </div>
              </dl>
              {output.keywords && output.keywords.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {output.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {output.relatedCategories && output.relatedCategories.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Related categories</p>
                  <div className="flex flex-wrap gap-1">
                    {output.relatedCategories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-[10px] font-normal">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {output.contentSlug && <ArticleDownloads contentSlug={output.contentSlug} />}

          {relatedAgents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Related expert agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {relatedAgents.map((agent) => (
                    <li key={agent!.slug}>
                      <Link
                        href={`/agents/${agent!.slug}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {agent!.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{agent!.specialty}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
