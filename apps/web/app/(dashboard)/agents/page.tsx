import Link from "next/link";
import { Suspense } from "react";
import { ExpertAgentsView } from "@/components/agents/ExpertAgentsView";
import { PolicyLabPanels } from "@/components/policy-lab/PolicyLabPanels";
import { AGENTS } from "@/data/agents";
import { AGENT_CATEGORIES } from "@/data/types";
import { Button } from "@/components/ui/button";

export default function ExpertAgentsPage() {
  return (
    <div className="space-y-6">
      <div className="policy-network-header">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Agent Network</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Expert Agents</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {AGENTS.length} specialized AI experts across {AGENT_CATEGORIES.length} domains —
          governance, peace operations, legal policy, foresight, and evidence synthesis.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/sessions/new">Multi-agent session</Link>
          </Button>
        </div>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading agents…</p>}>
        <ExpertAgentsView />
      </Suspense>
      <PolicyLabPanels />
    </div>
  );
}
