import { cn } from "@/lib/utils";

const PHASES = [
  { id: "analysis", label: "Analysis" },
  { id: "debate", label: "Debate" },
  { id: "challenge", label: "Challenge" },
  { id: "consensus", label: "Consensus" },
  { id: "report", label: "Report" },
] as const;

function phaseIndex(phase: string): number {
  const normalized = phase.toLowerCase();
  const idx = PHASES.findIndex((p) => normalized.includes(p.id));
  if (idx >= 0) return idx;
  if (normalized === "complete" || normalized === "done") return PHASES.length;
  if (normalized === "queued" || normalized === "intake") return -1;
  return 0;
}

export function PhaseTimeline({ phase, className }: { phase: string; className?: string }) {
  const current = phaseIndex(phase);

  return (
    <ol
      className={cn("flex flex-wrap gap-2", className)}
      aria-label="Session phase progress"
    >
      {PHASES.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
              done && "border-accent/40 bg-accent/10 text-accent",
              active && "border-primary bg-primary/10 text-primary",
              !done && !active && "border-border text-muted-foreground",
            )}
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                done && "bg-accent text-white",
                active && "bg-primary text-primary-foreground",
                !done && !active && "bg-muted",
              )}
              aria-hidden
            >
              {done ? "✓" : i + 1}
            </span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
