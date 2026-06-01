import Link from "next/link";
import { PROJECTS } from "@/data/projects";
import { AGENTS } from "@/data/agents";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning"> = {
  Active: "success",
  Completed: "secondary",
  Planning: "warning",
};

function agentName(slug: string): string {
  return AGENTS.find((a) => a.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Active and completed research initiatives coordinating multiple expert agents for
          peace architecture, governance, and evidence synthesis.
        </p>
      </div>
      <ul className="grid gap-4 lg:grid-cols-2">
        {PROJECTS.map((project) => (
          <li key={project.id}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge variant={STATUS_VARIANT[project.status] ?? "secondary"}>
                    {project.status}
                  </Badge>
                </div>
                <CardDescription>Lead: {project.lead}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{project.summary}</p>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/70">
                    Assigned agents
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {project.agents.map((slug) => (
                      <li key={slug}>
                        <Link
                          href={`/agents/${slug}`}
                          className="rounded border border-border bg-muted/40 px-2 py-1 text-xs hover:border-primary/30 hover:text-primary"
                        >
                          {agentName(slug)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
