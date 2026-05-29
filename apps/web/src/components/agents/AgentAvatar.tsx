import { AGENT_ACCENT_CLASSES, getAgentMetaById } from "@/lib/agents";
import { cn } from "@/lib/utils";

export function AgentAvatar({
  agentId,
  size = "md",
  className,
}: {
  agentId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const meta = getAgentMetaById(agentId);
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };
  const label = meta?.displayName ?? agentId;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full ring-2",
        sizes[size],
        meta ? AGENT_ACCENT_CLASSES[meta.accentGroup] : "bg-muted ring-border",
        className,
      )}
      aria-label={label}
      title={label}
    >
      <span aria-hidden>{meta?.initials ?? agentId.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}
