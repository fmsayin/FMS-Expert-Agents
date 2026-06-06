"use client";

import type { DebateStatus } from "@/components/roundtable/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Swords } from "lucide-react";

type Props = {
  status: DebateStatus;
  participantCount: number;
  exchangeCount: number;
  durationSeconds: number;
  consensusScore?: number | null;
  disagreementScore?: number | null;
  strategicComplexityScore?: number | null;
  consensusRefreshing?: boolean;
  disagreementRefreshing?: boolean;
  progressLabel?: string | null;
  showLaunchButton?: boolean;
  onLaunch?: () => void;
  launchDisabled?: boolean;
  isLaunchLoading?: boolean;
};

const STATUS_LABELS: Record<DebateStatus, string> = {
  idle: "Ready",
  waiting: "Ready to launch",
  in_progress: "Debate in progress",
  consensus_building: "Building consensus",
  complete: "Analysis complete",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MetricSep() {
  return (
    <span className="shrink-0 text-[var(--rt-border)] select-none" aria-hidden>
      ·
    </span>
  );
}

function PctValue({
  value,
  accent,
  refreshing,
}: {
  value: number | null | undefined;
  accent?: boolean;
  refreshing?: boolean;
}) {
  const pending = value == null;
  if (refreshing && pending) {
    return (
      <strong
        className="font-normal text-[var(--rt-muted)] animate-pulse"
        aria-busy="true"
      >
        …
      </strong>
    );
  }
  return (
    <strong
      className={cn(
        pending && "font-normal text-[var(--rt-muted)]",
        !pending && accent && "text-[var(--rt-accent)]",
        !pending && !accent && "text-[var(--rt-text)]",
        !pending && refreshing && "animate-pulse opacity-80",
      )}
      aria-busy={refreshing || undefined}
    >
      {pending ? "—" : `${value}%`}
    </strong>
  );
}

export function DebateStatusBar({
  status,
  participantCount,
  exchangeCount,
  durationSeconds,
  consensusScore,
  disagreementScore,
  strategicComplexityScore,
  consensusRefreshing,
  disagreementRefreshing,
  progressLabel,
  showLaunchButton,
  onLaunch,
  launchDisabled,
  isLaunchLoading,
}: Props) {
  const steps: DebateStatus[] = [
    "waiting",
    "in_progress",
    "consensus_building",
    "complete",
  ];
  const currentStep =
    status === "idle"
      ? -1
      : steps.indexOf(status === "idle" ? "waiting" : status);

  const depthScore =
    strategicComplexityScore != null ? strategicComplexityScore : null;

  return (
    <div
      className="rt-controls-zone flex shrink-0 flex-col gap-1 border-b px-3 py-1 md:px-4"
      style={{
        borderColor: "var(--rt-border)",
      }}
      role="status"
      aria-live="polite"
      aria-label={`Debate status: ${STATUS_LABELS[status]}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-px text-[9px] font-semibold uppercase tracking-wider",
              status === "in_progress" && "border-[var(--rt-accent)] text-[var(--rt-accent)]",
              status === "consensus_building" && "border-[var(--rt-accent)] text-[var(--rt-accent)]",
              status === "complete" && "border-[var(--rt-accent)]/60 bg-[var(--rt-accent)]/10 text-[var(--rt-accent)]",
              (status === "idle" || status === "waiting") &&
                "border-[var(--rt-border)] text-[var(--rt-muted)]",
            )}
          >
            {STATUS_LABELS[status]}
          </span>
          {progressLabel && (
            <span className="text-[10px] text-[var(--rt-muted)]">{progressLabel}</span>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <div
            className="flex min-w-0 max-w-full items-center gap-x-1 overflow-hidden text-[9px] whitespace-nowrap text-[var(--rt-muted)] md:flex-nowrap"
            style={{ fontFamily: "var(--rt-font-body)" }}
            aria-label="Debate analytics"
          >
          <span className="shrink-0">
            <strong className="text-[var(--rt-text)]">{participantCount}</strong> participants
          </span>
          <MetricSep />
          <span className="shrink-0">
            <strong className="text-[var(--rt-text)]">{exchangeCount}</strong> exchanges
          </span>
          <MetricSep />
          <span className="shrink-0">
            <strong className="text-[var(--rt-text)]">{formatDuration(durationSeconds)}</strong>{" "}
            duration
          </span>
          <span
            className="mx-0.5 hidden shrink-0 text-[var(--rt-border)] select-none sm:inline"
            aria-hidden
          >
            |
          </span>
          <span className="shrink-0 truncate" title="Consensus">
            Consensus{" "}
            <PctValue
              value={consensusScore}
              accent
              refreshing={consensusRefreshing}
            />
          </span>
          <MetricSep />
          <span className="shrink-0 truncate" title="Disagreement">
            Disagreement{" "}
            <PctValue value={disagreementScore} refreshing={disagreementRefreshing} />
          </span>
          <MetricSep />
          <span className="shrink-0 truncate" title="Strategic depth">
            Strategic Depth <PctValue value={depthScore} />
          </span>
          </div>

          {showLaunchButton && onLaunch && (
            <Button
              type="button"
              size="sm"
              onClick={onLaunch}
              disabled={launchDisabled || isLaunchLoading}
              className={cn(
                "shrink-0 border px-3 text-[11px] font-semibold shadow-none",
                "border-[var(--rt-accent)] bg-[var(--rt-accent)] text-[var(--rt-bg)]",
                "hover:bg-[var(--rt-accent)]/90 hover:text-[var(--rt-bg)]",
                "disabled:opacity-50",
              )}
              style={{ fontFamily: "var(--rt-font-head)" }}
              aria-label={
                isLaunchLoading ? "Round table debate in progress" : "Launch round table debate"
              }
            >
              {isLaunchLoading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Swords className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              )}
              {isLaunchLoading ? "Launching…" : "Launch Debate"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-0.5" aria-hidden>
        {steps.map((step, i) => (
          <div
            key={step}
            className={cn(
              "h-0.5 flex-1 rounded-full transition-colors",
              i <= currentStep ? "bg-[var(--rt-accent)]" : "bg-[var(--rt-border)]",
            )}
          />
        ))}
      </div>
    </div>
  );
}
