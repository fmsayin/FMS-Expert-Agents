"use client";

import { useState } from "react";
import type { ThinkTankAnalysis, TurkishExecutiveReport } from "@/components/roundtable/types";
import { THINK_TANK_REPORT_SECTIONS } from "@/components/roundtable/types";
import {
  hasLiveThinkTankAnalysis,
  resolveThinkTankDisplay,
  SAMPLE_ANALYSIS_LABEL_EN,
  SAMPLE_ANALYSIS_LABEL_TR,
  SAMPLE_TURKISH_EXECUTIVE_REPORT,
} from "@/components/roundtable/sample-analysis";
import {
  observerSampleCardClassName,
  observerSampleSectionClassName,
} from "@/components/roundtable/figure-portrait";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";

type Props = {
  analysis: ThinkTankAnalysis | null;
  isLoading: boolean;
  isPlaceholder: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
  disabledReason?: string | null;
  embedded?: boolean;
  turkishReport?: TurkishExecutiveReport | null;
  /** Show Turkish sample blocks when bilingual and no live TR report yet */
  showTurkishSample?: boolean;
};

const TURKISH_REPORT_TABS: { key: keyof TurkishExecutiveReport; label: string }[] = [
  { key: "yoneticiOzeti", label: "TR Özet" },
  { key: "konsensus", label: "TR Konsensüs" },
  { key: "anlasmazliklar", label: "TR Anlaşmazlık" },
  { key: "riskler", label: "TR Risk" },
  { key: "oneriler", label: "TR Öneri" },
];

function SampleBadge({ bilingual }: { bilingual?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Badge
        variant="outline"
        className="border-[color-mix(in_srgb,var(--rt-accent)_42%,var(--rt-border))] bg-[color-mix(in_srgb,var(--rt-surface)_90%,var(--rt-bg))] px-1.5 py-0 text-[8px] font-semibold uppercase tracking-wider text-[var(--rt-muted)]"
        style={{ fontFamily: "var(--rt-font-head)" }}
      >
        {SAMPLE_ANALYSIS_LABEL_EN}
      </Badge>
      {bilingual && (
        <Badge
          variant="outline"
          className="border-[color-mix(in_srgb,var(--rt-accent)_42%,var(--rt-border))] bg-[color-mix(in_srgb,var(--rt-surface)_90%,var(--rt-bg))] px-1.5 py-0 text-[8px] font-semibold uppercase tracking-wider text-[var(--rt-muted)]"
          style={{ fontFamily: "var(--rt-font-head)" }}
        >
          {SAMPLE_ANALYSIS_LABEL_TR}
        </Badge>
      )}
    </span>
  );
}

function ScoresRow({
  display,
  showingSample,
}: {
  display: ThinkTankAnalysis;
  showingSample: boolean;
}) {
  return (
    <div
      className="mb-3 flex flex-wrap gap-3 rounded-md border px-3 py-2 text-[10px]"
      style={{
        borderColor: "color-mix(in srgb, var(--rt-accent) 28%, var(--rt-border))",
        backgroundColor: "color-mix(in srgb, var(--rt-bg) 92%, var(--rt-surface))",
        fontFamily: "var(--rt-font-head)",
      }}
      aria-label="Consensus metrics"
    >
      <div className="flex items-baseline gap-1.5">
        <span className="font-semibold uppercase tracking-wide text-[var(--rt-muted)]">
          Consensus
        </span>
        <span className="text-[13px] font-semibold tabular-nums text-[var(--rt-accent)]">
          {showingSample ? "—" : (display.consensusScore ?? "—")}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-semibold uppercase tracking-wide text-[var(--rt-muted)]">
          Disagreement
        </span>
        <span className="text-[13px] font-semibold tabular-nums text-[var(--rt-text)]">
          {showingSample ? "—" : (display.disagreementScore ?? "—")}
        </span>
      </div>
      {showingSample && (
        <span className="text-[9px] italic text-[var(--rt-muted)]">
          Scores populate after live analysis
        </span>
      )}
    </div>
  );
}

function ReportSections({
  display,
  showingSample,
  defaultOpenId = "summary",
}: {
  display: ThinkTankAnalysis;
  showingSample: boolean;
  defaultOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  return (
    <div className="space-y-2" role="region" aria-label="Think tank report sections">
      {THINK_TANK_REPORT_SECTIONS.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div
            key={section.id}
            className={cn(observerSampleCardClassName(), showingSample && "opacity-[0.98]")}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rt-accent)]"
              aria-expanded={isOpen}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--rt-text)]"
                style={{ fontFamily: "var(--rt-font-serif, var(--rt-font-head))" }}
              >
                {section.label}
              </span>
              {isOpen ? (
                <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[var(--rt-muted)]" aria-hidden />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--rt-muted)]" aria-hidden />
              )}
            </button>
            {isOpen && (
              <p
                className="mt-2 text-[13px] leading-relaxed text-[var(--rt-text)]"
                style={{ fontFamily: "var(--rt-font-body)" }}
              >
                {display[section.key]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ThinkTankOutputs({
  analysis,
  isLoading,
  isPlaceholder,
  onGenerate,
  canGenerate,
  disabledReason,
  embedded = false,
  turkishReport,
  showTurkishSample = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { display, showingSample } = resolveThinkTankDisplay(analysis, isPlaceholder);
  const turkishDisplay = turkishReport ?? (showTurkishSample ? SAMPLE_TURKISH_EXECUTIVE_REPORT : null);
  const turkishIsSample = !turkishReport && showTurkishSample && Boolean(turkishDisplay);

  if (!embedded && !display && !isLoading && !canGenerate) return null;

  return (
    <section
      className={embedded ? "" : "border-t"}
      style={embedded ? undefined : { borderColor: "var(--rt-border)" }}
      aria-label="Think tank outputs"
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 py-2",
          embedded ? "px-3" : "px-4 md:px-5",
        )}
        style={{ backgroundColor: "var(--rt-surface)" }}
      >
        <button
          type="button"
          onClick={() => !embedded && setCollapsed((c) => !c)}
          className="flex flex-wrap items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rt-accent)]"
          aria-expanded={!collapsed}
          disabled={embedded}
        >
          <Sparkles className="h-4 w-4 text-[var(--rt-accent)]" aria-hidden />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest text-[var(--rt-text)]"
            style={{ fontFamily: "var(--rt-font-serif, var(--rt-font-head))" }}
          >
            Think Tank Outputs
          </span>
          {showingSample && <SampleBadge bilingual={showTurkishSample} />}
          {!embedded &&
            (collapsed ? (
              <ChevronDown className="h-4 w-4 text-[var(--rt-muted)]" aria-hidden />
            ) : (
              <ChevronUp className="h-4 w-4 text-[var(--rt-muted)]" aria-hidden />
            ))}
        </button>

        {!hasLiveThinkTankAnalysis(analysis, isPlaceholder) && canGenerate && !embedded && (
          <Button
            type="button"
            size="sm"
            onClick={onGenerate}
            disabled={isLoading}
            className="border border-[var(--rt-accent)] bg-transparent text-[var(--rt-accent)] hover:bg-[var(--rt-accent)] hover:text-[var(--rt-bg)]"
            aria-label="Generate think tank analysis"
          >
            Generate Analysis
          </Button>
        )}
      </div>

      {(!collapsed || embedded) && (
        <div className={cn(embedded ? "px-3 pb-3" : "px-4 pb-4 md:px-5")}>
          {disabledReason && showingSample && (
            <p className="mb-2 text-[11px] text-[var(--rt-muted)]" role="note">
              {disabledReason}
            </p>
          )}

          {isLoading && (
            <div
              className="mb-2 flex items-center gap-2 text-[10px] text-[var(--rt-accent)]"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Generating analysis…
            </div>
          )}

          <div
            className={cn(observerSampleSectionClassName(), isLoading && "opacity-80")}
            aria-busy={isLoading}
          >
            <ScoresRow display={display} showingSample={showingSample} />
            <ReportSections display={display} showingSample={showingSample} />
          </div>

          {turkishDisplay && (
            <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--rt-border)" }}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p
                  className="text-[9px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
                  style={{ fontFamily: "var(--rt-font-serif, var(--rt-font-head))" }}
                >
                  Turkish Executive (Bilingual)
                </p>
                {turkishIsSample && <SampleBadge />}
              </div>
              <div className="space-y-2">
                {TURKISH_REPORT_TABS.map((tab) => (
                  <div key={tab.key} className={observerSampleCardClassName()}>
                    <p
                      className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--rt-accent)]"
                      style={{ fontFamily: "var(--rt-font-head)" }}
                    >
                      {tab.label}
                    </p>
                    <p
                      className="text-[11px] leading-relaxed text-[var(--rt-text)]"
                      style={{ fontFamily: "var(--rt-font-body)" }}
                    >
                      {turkishDisplay[tab.key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
