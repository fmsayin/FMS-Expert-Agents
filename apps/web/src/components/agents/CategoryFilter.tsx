"use client";

import { AGENT_CATEGORIES, type AgentCategory } from "@/data/types";
import { cn } from "@/lib/utils";

export function CategoryFilter({
  selected,
  onChange,
  counts,
}: {
  selected: AgentCategory | "all";
  onChange: (category: AgentCategory | "all") => void;
  counts?: Partial<Record<AgentCategory | "all", number>>;
}) {
  const items: { key: AgentCategory | "all"; label: string }[] = [
    { key: "all", label: "All categories" },
    ...AGENT_CATEGORIES.map((c) => ({ key: c, label: c.replace(/ Agents$/, "") })),
  ];

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filter by category"
    >
      {items.map((item) => {
        const active = selected === item.key;
        const count = counts?.[item.key];
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-gold/50 bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
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
