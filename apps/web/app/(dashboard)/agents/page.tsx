import { Suspense } from "react";
import { ExpertAgentsView } from "@/components/agents/ExpertAgentsView";
import { AGENTS } from "@/data/agents";
import { AGENT_CATEGORIES } from "@/data/types";

export default function ExpertAgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expert Agents</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {AGENTS.length} specialized AI experts across {AGENT_CATEGORIES.length} domains — from AI
          governance and peace operations to legal policy, research writing, strategic foresight,
          and evidence synthesis.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading agents…</p>}>
        <ExpertAgentsView />
      </Suspense>
    </div>
  );
}