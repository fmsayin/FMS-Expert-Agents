import Link from "next/link";
import { AGENTS, AVAILABLE_AGENT_COUNT } from "@/data/agents";
import { FEATURED_OUTPUT, RESEARCH_OUTPUTS } from "@/data/research-outputs";
import { PROJECTS } from "@/data/projects";
import { MISSION_STATEMENT } from "@/lib/agents";
import { AgentCard } from "@/components/agents/AgentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, BookOpen, FolderKanban, Users } from "lucide-react";

const FEATURED_SLUGS = [
  "chief-peace-architect",
  "ai-governance-analyst",
  "diplomatic-affairs-specialist",
  "humanitarian-affairs-specialist",
];

export default function HomePage() {
  const featured = FEATURED_SLUGS.map((slug) => AGENTS.find((a) => a.slug === slug)).filter(
    Boolean,
  ) as typeof AGENTS;
  const activeProjects = PROJECTS.filter((p) => p.status === "Active").length;
  const recentOutputs = RESEARCH_OUTPUTS.filter((o) => !o.featured).slice(0, 3);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-br from-primary via-primary to-primary/85 p-8 text-primary-foreground shadow-lg md:p-10">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-light">
          FMS Expert Agents
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {MISSION_STATEMENT}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/85 md:text-base">
          Institutional AI governance and peace & security think-tank platform. Convene
          specialized expert agents for structured analysis, policy synthesis, and strategic
          foresight.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary" className="bg-gold text-gold-dark hover:bg-gold/90">
            <Link href="/agents">Browse expert agents</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link href="/outputs">View research outputs</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Expert agents",
            value: String(AGENTS.length),
            sub: `${AVAILABLE_AGENT_COUNT} available`,
            href: "/agents",
            icon: Bot,
          },
          {
            label: "Research outputs",
            value: String(RESEARCH_OUTPUTS.length),
            sub: "Publications & briefs",
            href: "/outputs",
            icon: BookOpen,
          },
          {
            label: "Active projects",
            value: String(activeProjects),
            sub: `${PROJECTS.length} total`,
            href: "/projects",
            icon: FolderKanban,
          },
          {
            label: "Agent categories",
            value: "7",
            sub: "Governance to evidence",
            href: "/agents",
            icon: Users,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <Icon className="h-4 w-4 text-gold" aria-hidden />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured expert agents</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/agents">View all</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      </section>

      {FEATURED_OUTPUT?.slug && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured research</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/outputs">View all outputs</Link>
            </Button>
          </div>
          <Card className="border-gold/25 bg-gradient-to-r from-primary/5 to-gold/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge className="bg-gold text-gold-dark text-[10px]">Featured</Badge>
                <Badge variant="outline" className="text-[10px]">
                  {FEATURED_OUTPUT.type}
                </Badge>
              </div>
              <CardTitle className="font-serif text-lg leading-snug">
                <Link href={`/outputs/${FEATURED_OUTPUT.slug}`} className="hover:text-primary">
                  {FEATURED_OUTPUT.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2">{FEATURED_OUTPUT.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm" variant="outline">
                <Link href={`/outputs/${FEATURED_OUTPUT.slug}`}>Read article</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent research outputs</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/outputs">View all</Link>
          </Button>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {recentOutputs.map((output) => (
            <li key={output.id}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {output.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{output.date}</span>
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {output.slug ? (
                      <Link href={`/outputs/${output.slug}`} className="hover:text-primary">
                        {output.title}
                      </Link>
                    ) : (
                      output.title
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="line-clamp-2 text-sm text-muted-foreground">
                  {output.summary}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
