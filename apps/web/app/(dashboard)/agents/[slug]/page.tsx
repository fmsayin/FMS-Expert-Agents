import Link from "next/link";
import { notFound } from "next/navigation";
import { AGENTS, getAgentBySlug } from "@/data/agents";
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return AGENTS.map((agent) => ({ slug: agent.slug }));
}

export default async function AgentProfilePage({ params }: Props) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) notFound();

  const related = AGENTS.filter(
    (a) => a.category === agent.category && a.slug !== agent.slug,
  ).slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/agents">
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
          Back to agents
        </Link>
      </Button>

      <header className="rounded-xl border border-gold/20 bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
              {agent.category}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{agent.name}</h1>
            <p className="mt-2 text-lg text-primary">{agent.specialty}</p>
          </div>
          <AgentStatusBadge status={agent.status} />
        </div>
        <p className="mt-6 leading-relaxed text-muted-foreground">{agent.description}</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold">Capabilities</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {agent.capabilities.map((cap) => (
            <li
              key={cap}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
              {cap}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Sample outputs</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            Structured policy brief aligned with FMS analytical standards
          </li>
          <li className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            Cross-domain synthesis memo for multilateral decision-makers
          </li>
          <li className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            Evidence-backed recommendations with citation discipline
          </li>
        </ul>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/projects">View related projects</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/outputs">View research outputs</Link>
        </Button>
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Related agents</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <Card key={r.slug}>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">
                    <Link href={`/agents/${r.slug}`} className="hover:text-primary">
                      {r.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                  {r.specialty}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
