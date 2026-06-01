"use client";

import type { AgentStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const STATUSES: { key: AgentStatus | "all"; label: string }[] = [
  { key: "all", label: "All statuses" },
  { key: "Available", label: "Available" },
  { key: "In Session", label: "In Session" },
  { key: "Offline", label: "Offline" },
];

export function StatusFilter({
  selected,
  onChange,
  counts,
}: {
  selected: AgentStatus | "all";
  onChange: (status: AgentStatus | "all") => void;
  counts?: Partial<Record<AgentStatus | "all", number>>;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
      {STATUSES.map((item) => {
        const active = selected === item.key;
        const count = counts?.[item.key];
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {count !== undefined && (
              <span className={cn("ml-1.5 tabular-nums", active ? "opacity-80" : "opacity-60")}>
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
