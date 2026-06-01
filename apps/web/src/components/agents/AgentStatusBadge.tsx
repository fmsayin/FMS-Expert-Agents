import { Badge } from "@/components/ui/badge";
import type { AgentStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  AgentStatus,
  { variant: "success" | "warning" | "secondary"; dot: string }
> = {
  Available: { variant: "success", dot: "bg-accent" },
  "In Session": { variant: "warning", dot: "bg-warning" },
  Offline: { variant: "secondary", dot: "bg-muted-foreground/50" },
};

export function AgentStatusBadge({
  status,
  className,
}: {
  status: AgentStatus;
  className?: string;
}) {
  const style = STATUS_STYLES[status];
  return (
    <Badge variant={style.variant} className={cn("shrink-0 font-medium", className)}>
      <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
      {status}
    </Badge>
  );
}
