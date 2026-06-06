import Link from "next/link";
import { PolicyLabPanels } from "@/components/policy-lab/PolicyLabPanels";
import { Button } from "@/components/ui/button";

export default function PolicyLabPage() {
  return (
    <div className="space-y-6">
      <div className="policy-network-header">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Policy Lab</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Multi-agent intelligence workspace
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Scenario simulation, risk analysis, and consensus mapping — structured deliberation across
          expert agents. Backend integrations are placeholders; use sessions and round table for live
          debate today.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/sessions/new">New session</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-primary/30">
            <Link href="/agents">Expert agents catalog</Link>
          </Button>
        </div>
      </div>
      <PolicyLabPanels />
    </div>
  );
}
