import Link from "next/link";
import { GitBranch, Map, ShieldAlert, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PANELS = [
  {
    id: "scenario",
    title: "Scenario Simulation",
    description: "Multi-agent stress tests on policy forks and escalation paths.",
    icon: GitBranch,
    status: "Coming soon",
  },
  {
    id: "risk",
    title: "Risk Analysis",
    description: "Structured threat matrices across governance, security, and humanitarian domains.",
    icon: ShieldAlert,
    status: "Coming soon",
  },
  {
    id: "consensus",
    title: "Consensus Map",
    description: "Visualize alignment and dissent across expert agent positions.",
    icon: Map,
    status: "Coming soon",
  },
] as const;

export function PolicyLabPanels({ className }: { className?: string }) {
  return (
    <section className={cn("space-y-4", className)} aria-labelledby="policy-lab-panels">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="policy-lab-panels" className="text-lg font-semibold tracking-tight">
            Policy Lab
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Intelligence panels for structured multi-agent analysis — UI shells; backend integration
            pending.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 border-primary/30">
          <Link href="/sessions/new">
            <Users className="mr-2 h-4 w-4" aria-hidden />
            Start multi-agent session
          </Link>
        </Button>
      </div>
      <ul className="grid gap-3 md:grid-cols-3">
        {PANELS.map((panel) => {
          const Icon = panel.icon;
          return (
            <li key={panel.id}>
              <div className="policy-glass flex h-full flex-col p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {panel.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold">{panel.title}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {panel.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="policy-glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Convene historical voices or expert agents for structured debate.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="border-primary/30">
            <Link href="/sessions">View sessions</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
