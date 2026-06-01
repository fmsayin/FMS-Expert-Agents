import Link from "next/link";
import type { ShowcaseAgent } from "@/data/types";
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AgentCard({
  agent,
  className,
}: {
  agent: ShowcaseAgent;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col border-border/80 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary ring-1 ring-gold/30"
              aria-hidden
            >
              {initials(agent.name)}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-snug">{agent.name}</CardTitle>
              <CardDescription className="mt-1 text-xs font-medium text-gold-dark">
                {agent.specialty}
              </CardDescription>
            </div>
          </div>
          <AgentStatusBadge status={agent.status} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {agent.description}
        </p>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/70">
          Capabilities
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {agent.capabilities.map((cap) => (
            <li
              key={cap}
              className="rounded border border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {cap}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-border/60 bg-muted/20 pt-4">
        <Button asChild variant="outline" size="sm" className="w-full border-primary/20">
          <Link href={`/agents/${agent.slug}`}>View Agent</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
