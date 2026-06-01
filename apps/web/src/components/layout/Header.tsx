import { AGENTS, AVAILABLE_AGENT_COUNT } from "@/data/agents";
import { HeaderSearch } from "@/components/layout/HeaderSearch";

export function Header({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <header className="border-b border-border bg-background/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          {title ? (
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          ) : (
            <p className="text-sm font-medium text-primary">FMS Expert Agents Platform</p>
          )}
          <p className="mt-0.5 text-sm text-muted-foreground">
            {subtitle ??
              `${AVAILABLE_AGENT_COUNT} available · ${AGENTS.length} specialists across 7 domains`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <HeaderSearch />
          <span className="hidden shrink-0 items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold-dark sm:inline-flex">
            Institutional AI · Peace & Security
          </span>
        </div>
      </div>
    </header>
  );
}
