"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AGENTS } from "@/data/agents";
import { compareDisplayNames } from "@/lib/figure-sort";
import type { AgentCategory, AgentStatus } from "@/data/types";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { CategoryFilter } from "@/components/agents/CategoryFilter";
import { SearchBar } from "@/components/agents/SearchBar";
import { StatusFilter } from "@/components/agents/StatusFilter";

export function ExpertAgentsView() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AgentCategory | "all">("all");
  const [status, setStatus] = useState<AgentStatus | "all">("all");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const categoryCounts = useMemo(() => {
    const map: Partial<Record<AgentCategory | "all", number>> = { all: AGENTS.length };
    for (const agent of AGENTS) {
      map[agent.category] = (map[agent.category] ?? 0) + 1;
    }
    return map;
  }, []);

  const statusCounts = useMemo(() => {
    const map: Partial<Record<AgentStatus | "all", number>> = { all: AGENTS.length };
    for (const agent of AGENTS) {
      map[agent.status] = (map[agent.status] ?? 0) + 1;
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AGENTS.filter((agent) => {
      if (category !== "all" && agent.category !== category) return false;
      if (status !== "all" && agent.status !== status) return false;
      if (!q) return true;
      const haystack = [
        agent.name,
        agent.specialty,
        agent.description,
        agent.category,
        ...agent.capabilities,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => compareDisplayNames(a.name, b.name));
  }, [query, category, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SearchBar value={query} onChange={setQuery} className="w-full lg:max-w-md" />
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
          {AGENTS.length} expert agents
        </p>
      </div>
      <CategoryFilter selected={category} onChange={setCategory} counts={categoryCounts} />
      <StatusFilter selected={status} onChange={setStatus} counts={statusCounts} />
      <AgentGrid agents={filtered} />
    </div>
  );
}
