import Link from "next/link";
import { AGENTS, AVAILABLE_AGENT_COUNT } from "@/data/agents";
import { FEATURED_OUTPUT, RESEARCH_OUTPUTS } from "@/data/research-outputs";
import { PROJECTS } from "@/data/projects";
import { MISSION_STATEMENT } from "@/lib/mission";
import { AgentCard } from "@/components/agents/AgentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, BookOpen, FlaskConical, FolderKanban, Users } from "lucide-react";

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
  const recentOutputs = RESEARCH_OUTPUTS.filter((o) => !o.featured).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="platform-hero">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Intelligence Center
        </p>
        <h1 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
          {MISSION_STATEMENT}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Personal AI think-tank OS — convene expert agents, run policy lab sessions, and publish
          research outputs.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="default">
            <Link href="/agents">Expert agents</Link>
          </Button>
          <Button asChild size="default" variant="secondary">
            <Link href="/sessions/new">New session</Link>
          </Button>
          <Button asChild size="default" variant="outline">
            <Link href="/outputs">Research outputs</Link>
          </Button>
        </div>
      </section>

      <section className="platform-stat-grid">
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
            label: "Policy Lab",
            value: "3",
            sub: "Panels (preview)",
            href: "/policy-lab",
            icon: FlaskConical,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="platform-card h-full transition-all group-hover:border-primary/30 group-hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
                  <CardDescription className="text-xs">{stat.label}</CardDescription>
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <p className="text-xl font-semibold tabular-nums">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Featured expert agents</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/agents">View all</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      </section>

      {FEATURED_OUTPUT?.slug && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured research</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/outputs">All outputs</Link>
            </Button>
          </div>
          <Card className="platform-card border-primary/20">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <Badge className="text-[10px]">Featured</Badge>
                <Badge variant="outline" className="text-[10px]">
                  {FEATURED_OUTPUT.type}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-base leading-snug">
                <Link href={`/outputs/${FEATURED_OUTPUT.slug}`} className="hover:text-primary">
                  {FEATURED_OUTPUT.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2 text-sm">
                {FEATURED_OUTPUT.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button asChild size="sm">
                <Link href={`/outputs/${FEATURED_OUTPUT.slug}`}>Read article</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent outputs</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/outputs">View all</Link>
            </Button>
          </div>
          <ul className="grid gap-2 md:grid-cols-2">
            {recentOutputs.map((output) => (
              <li key={output.id}>
                <Card className="platform-card h-full">
                  <CardHeader className="p-3 pb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {output.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{output.date}</span>
                    </div>
                    <CardTitle className="mt-1 text-sm leading-snug">
                      {output.slug ? (
                        <Link href={`/outputs/${output.slug}`} className="hover:text-primary">
                          {output.title}
                        </Link>
                      ) : (
                        output.title
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="line-clamp-2 p-3 pt-0 text-xs text-muted-foreground">
                    {output.summary}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
        <Card className="platform-card flex h-fit flex-col gap-3 p-4 lg:min-w-[220px]">
          <h3 className="text-sm font-semibold">Quick actions</h3>
          <Button asChild size="sm" className="w-full justify-start">
            <Link href="/policy-lab">
              <Users className="mr-2 h-4 w-4" aria-hidden />
              Policy Lab
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
