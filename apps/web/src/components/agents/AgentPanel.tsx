import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgentMetaById } from "@/lib/agents";
import { cn } from "@/lib/utils";

export type AgentStatus = "idle" | "speaking" | "done" | "analyzing";

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: "Idle",
  speaking: "Speaking",
  done: "Done",
  analyzing: "Analyzing",
};

const STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-muted-foreground/40",
  speaking: "bg-primary animate-pulse",
  done: "bg-accent",
  analyzing: "bg-warning",
};

export function AgentPanel({
  agentId,
  status = "idle",
  compact = false,
}: {
  agentId: string;
  status?: AgentStatus;
  compact?: boolean;
}) {
  const meta = getAgentMetaById(agentId);

  return (
    <Card className={cn(compact && "shadow-none")}>
      <CardHeader className={cn("flex flex-row items-center gap-3 space-y-0", compact && "p-3")}>
        <AgentAvatar agentId={agentId} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <CardTitle className={cn("truncate text-sm", compact && "text-xs")}>
            {meta?.displayName ?? agentId}
          </CardTitle>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={cn("h-2 w-2 rounded-full", STATUS_DOT[status])}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">{STATUS_LABEL[status]}</span>
            {meta?.ethicsVeto && (
              <Badge variant="warning" className="text-[10px]">
                Ethics veto
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      {!compact && (
        <CardContent className="pt-0 text-xs text-muted-foreground">
          Domain expert · {meta?.accentGroup ?? "general"}
        </CardContent>
      )}
    </Card>
  );
}
