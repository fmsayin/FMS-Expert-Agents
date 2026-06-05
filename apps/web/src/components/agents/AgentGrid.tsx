import type { Agent } from "@/data/types";
import { AgentCard } from "@/components/agents/AgentCard";
import { cn } from "@/lib/utils";

export function AgentGrid({
  agents,
  className,
}: {
  agents: Agent[];
  className?: string;
}) {
  if (agents.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No agents match your filters.
      </p>
    );
  }

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4", className)}>
      {agents.map((agent) => (
        <AgentCard key={agent.slug} agent={agent} />
      ))}
    </div>
  );
}
