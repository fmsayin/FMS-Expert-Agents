import Link from "next/link";
import { RESEARCH_OUTPUTS } from "@/data/research-outputs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OutputsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Research Outputs</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Policy briefs, strategic reviews, working papers, and frameworks produced through
          FMS expert-agent analysis and structured deliberation.
        </p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {RESEARCH_OUTPUTS.map((output) => (
          <li key={output.id}>
            <Card className="h-full border-border/80 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{output.type}</Badge>
                  <span className="text-xs text-muted-foreground">{output.date}</span>
                </div>
                <CardTitle className="text-lg leading-snug">
                  <Link href={`/outputs#${output.id}`} className="hover:text-primary">
                    {output.title}
                  </Link>
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
    </div>
  );
}
