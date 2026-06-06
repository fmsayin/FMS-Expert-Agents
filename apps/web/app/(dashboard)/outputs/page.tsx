import Link from "next/link";
import { FEATURED_OUTPUT, RESEARCH_OUTPUTS } from "@/data/research-outputs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";

export default function OutputsPage() {
  const featured = FEATURED_OUTPUT;
  const others = RESEARCH_OUTPUTS.filter((o) => !o.featured);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Publications
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Research Outputs</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Policy briefs, strategic reviews, working papers, and academic articles produced through
          FMS expert-agent analysis and structured deliberation.
        </p>
      </div>

      {featured?.slug && (
        <section aria-labelledby="featured-output-heading">
          <h2 id="featured-output-heading" className="sr-only">
            Featured publication
          </h2>
          <Card className="overflow-hidden border-gold/30 bg-gradient-to-br from-primary/5 via-card to-gold/5 shadow-md">
            <CardHeader className="border-b border-gold/15 bg-primary/5 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-gold text-gold-dark hover:bg-gold/90">Featured</Badge>
                <Badge variant="outline">{featured.type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {featured.date.startsWith("2026") ? "May 2026" : featured.date}
                </span>
                {featured.wordCount != null && (
                  <span className="text-xs text-muted-foreground">
                    · {featured.wordCount.toLocaleString()} words
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-start gap-3">
                <BookOpen className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden />
                <div>
                  <CardTitle className="font-serif text-xl leading-snug md:text-2xl">
                    {featured.title}
                  </CardTitle>
                  {featured.author && (
                    <p className="mt-2 text-sm font-medium text-primary">{featured.author}</p>
                  )}
                  {featured.affiliation && (
                    <p className="text-xs text-muted-foreground">{featured.affiliation}</p>
                  )}
                </div>
              </div>
              <CardDescription className="mt-3 text-base leading-relaxed">
                {featured.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild className="shrink-0 bg-primary hover:bg-primary/90">
                <Link href={`/outputs/${featured.slug}`}>
                  Read full article
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">All outputs</h2>
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {others.map((output) => (
            <li key={output.id}>
              <Card className="h-full border-border/80 transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{output.type}</Badge>
                    <span className="text-xs text-muted-foreground">{output.date}</span>
                  </div>
                  <CardTitle className="text-lg leading-snug">
                    {output.slug ? (
                      <Link href={`/outputs/${output.slug}`} className="hover:text-primary">
                        {output.title}
                      </Link>
                    ) : (
                      <span>{output.title}</span>
                    )}
                  </CardTitle>
                  <CardDescription>{output.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {output.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
