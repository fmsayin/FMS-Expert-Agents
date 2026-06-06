"use client";

import type {
  RoundTableChatMessage,
  TurkishExecutiveReport,
  TurkishSummaryEntry,
  TurkishViewMode,
} from "@/components/roundtable/types";
import {
  observerSampleCardClassName,
  observerSampleSectionClassName,
} from "@/components/roundtable/figure-portrait";
import {
  SAMPLE_TURKISH_OBSERVER_ENTRIES,
  SAMPLE_TURKISH_OBSERVER_HINT,
  SAMPLE_TURKISH_OBSERVER_LABEL,
  SAMPLE_TURKISH_OBSERVER_TITLE,
} from "@/components/roundtable/sample-turkish-observer";
import { TurkishExport } from "@/components/roundtable/TurkishExport";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Eye, Loader2, ScrollText } from "lucide-react";

type Props = {
  summaries: TurkishSummaryEntry[];
  report: TurkishExecutiveReport | null;
  isReportLoading: boolean;
  reportError: string | null;
  onGenerateReport: () => void;
  canGenerateReport: boolean;
  viewMode: TurkishViewMode;
  topicTitle: string;
  topicFull?: string;
  messages: RoundTableChatMessage[];
  disabled?: boolean;
  /** When true, omit outer aside wrapper (used inside tab panel) */
  embedded?: boolean;
};

const REPORT_SECTIONS: {
  key: keyof TurkishExecutiveReport;
  label: string;
}[] = [
  { key: "yoneticiOzeti", label: "Yönetici Özeti" },
  { key: "konsensus", label: "Konsensüs" },
  { key: "anlasmazliklar", label: "Anlaşmazlıklar" },
  { key: "riskler", label: "Riskler" },
  { key: "oneriler", label: "Öneriler" },
];

const STRUCTURED_LABELS: { key: keyof NonNullable<TurkishSummaryEntry["structured"]>; label: string }[] = [
  { key: "anaArguman", label: "Ana Argüman" },
  { key: "stratejikCikarim", label: "Stratejik Çıkarım" },
  { key: "politikaIliskisi", label: "Politika İlişkisi" },
];

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StructuredSummaryBody({ entry }: { entry: TurkishSummaryEntry }) {
  if (entry.structured) {
    return (
      <dl className="space-y-2">
        {STRUCTURED_LABELS.map(({ key, label }) => {
          const value = entry.structured?.[key];
          if (!value) return null;
          return (
            <div key={key}>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-[var(--rt-accent)]">
                {label}
              </dt>
              <dd className="mt-0.5 text-[11px] leading-relaxed text-[var(--rt-text)]">
                {value}
              </dd>
            </div>
          );
        })}
      </dl>
    );
  }
  return (
    <p
      className="text-[12px] leading-relaxed text-[var(--rt-text)]"
      style={{ fontFamily: "var(--rt-font-body)" }}
    >
      {entry.summary}
    </p>
  );
}

function SampleObserverContent({ subdued }: { subdued?: boolean }) {
  return (
    <section
      className={cn(observerSampleSectionClassName(), subdued && "opacity-75")}
      aria-label="Örnek stratejik özet"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3
          className="text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
          style={{ fontFamily: "var(--rt-font-head)" }}
        >
          {SAMPLE_TURKISH_OBSERVER_TITLE}
        </h3>
        <span
          className="rounded border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[var(--rt-muted)]"
          style={{
            borderColor: "color-mix(in srgb, var(--rt-accent) 25%, var(--rt-border))",
            fontFamily: "var(--rt-font-head)",
          }}
        >
          {SAMPLE_TURKISH_OBSERVER_LABEL}
        </span>
      </div>
      <ul className="space-y-3">
        {SAMPLE_TURKISH_OBSERVER_ENTRIES.map((sample) => (
          <li key={sample.figureName} className={observerSampleCardClassName()}>
            <p className="mb-1.5 text-[11px] font-semibold text-[var(--rt-accent)]">
              {sample.figureName}
            </p>
            <p
              className="mb-2 text-[11px] italic leading-relaxed text-[var(--rt-muted)]"
              style={{ fontFamily: "var(--rt-font-body)" }}
            >
              {sample.preview}
            </p>
            <dl className="space-y-1.5">
              {STRUCTURED_LABELS.map(({ key, label }) => (
                <div key={key}>
                  <dt className="text-[9px] font-semibold uppercase tracking-wide text-[var(--rt-accent)]">
                    {label}
                  </dt>
                  <dd
                    className="mt-0.5 text-[10px] leading-snug text-[var(--rt-text)]"
                    style={{ fontFamily: "var(--rt-font-body)" }}
                  >
                    {sample.structured[key]}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center text-[9px] italic text-[var(--rt-muted)]">
        {SAMPLE_TURKISH_OBSERVER_HINT}
      </p>
    </section>
  );
}

export function TurkishAnalysisPanel({
  summaries,
  report,
  isReportLoading,
  reportError,
  onGenerateReport,
  canGenerateReport,
  viewMode,
  topicTitle,
  topicFull,
  messages,
  disabled,
  embedded = false,
}: Props) {
  const completedSummaries = summaries.filter((s) => !s.isLoading && !s.error);
  const showSample = completedSummaries.length === 0;
  const showSampleSubdued = summaries.length > 0 && showSample;

  const content = (
    <>
      <div
        className={cn("shrink-0 border-b px-3 py-2.5", !embedded && "rounded-t-none")}
        style={{
          borderColor: "var(--rt-border)",
          backgroundColor: "color-mix(in srgb, var(--rt-accent) 6%, var(--rt-surface))",
        }}
      >
        <div className="flex items-start gap-2">
          <Eye
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rt-accent)]"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-semibold leading-tight text-[var(--rt-text)]"
              style={{ fontFamily: "var(--rt-font-head)" }}
            >
              Turkish Strategic Observer
            </p>
            <p className="text-[10px] text-[var(--rt-muted)]">Türk Stratejik Gözlemci</p>
            <p className="mt-1 text-[9px] leading-snug text-[var(--rt-muted)]">
              Tartışmayı izler; katılımcı değildir. Canlı Türkçe özet ve stratejik analiz üretir.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {showSample && <SampleObserverContent subdued={showSampleSubdued} />}

        {summaries.length > 0 && (
          <section className="mb-4" aria-label="Canlı özetler">
            <h3
              className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
              style={{ fontFamily: "var(--rt-font-head)" }}
            >
              Canlı Özetler
            </h3>
            <ul className="space-y-3">
              {summaries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md border p-2.5"
                  style={{
                    borderColor: "var(--rt-border)",
                    backgroundColor: "var(--rt-bg)",
                  }}
                >
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[var(--rt-accent)]">
                      {entry.figureName}
                    </span>
                    {!entry.isLoading && (
                      <time
                        className="shrink-0 text-[9px] text-[var(--rt-muted)]"
                        dateTime={new Date(entry.timestamp).toISOString()}
                      >
                        {formatTime(entry.timestamp)}
                      </time>
                    )}
                  </div>
                  {entry.isLoading ? (
                    <div className="flex items-center gap-2 py-1" aria-busy="true">
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin text-[var(--rt-accent)]"
                        aria-hidden
                      />
                      <span className="text-[10px] text-[var(--rt-muted)]">Özetleniyor…</span>
                    </div>
                  ) : entry.error ? (
                    <p className="text-[11px] text-[var(--rt-accent)]">{entry.error}</p>
                  ) : (
                    <StructuredSummaryBody entry={entry} />
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-label="Yönetici raporu">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3
              className="text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
              style={{ fontFamily: "var(--rt-font-head)" }}
            >
              Yönetici Raporu
            </h3>
            {!report && canGenerateReport && (
              <Button
                type="button"
                size="sm"
                onClick={onGenerateReport}
                disabled={isReportLoading || disabled}
                className="h-7 border border-[var(--rt-accent)] bg-transparent px-2 text-[10px] text-[var(--rt-accent)] hover:bg-[var(--rt-accent)] hover:text-[var(--rt-bg)]"
                aria-label="Türkçe yönetici raporu oluştur"
              >
                {isReportLoading ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden />
                ) : (
                  <ScrollText className="mr-1 h-3 w-3" aria-hidden />
                )}
                Türkçe Rapor
              </Button>
            )}
          </div>

          {reportError && (
            <p className="mb-2 text-[10px] text-[var(--rt-accent)]" role="alert">
              {reportError}
            </p>
          )}

          {isReportLoading && (
            <div className="space-y-2 py-1" aria-busy="true">
              <Skeleton className="h-3 w-full bg-[var(--rt-border)]" />
              <Skeleton className="h-3 w-5/6 bg-[var(--rt-border)]" />
              <Skeleton className="h-16 w-full bg-[var(--rt-border)]" />
            </div>
          )}

          {report && !isReportLoading && (
            <div className="space-y-2">
              {REPORT_SECTIONS.map((section) => (
                <div
                  key={section.key}
                  className="rounded-md border p-2"
                  style={{
                    borderColor: "var(--rt-border)",
                    backgroundColor: "var(--rt-bg)",
                  }}
                >
                  <p
                    className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-[var(--rt-accent)]"
                    style={{ fontFamily: "var(--rt-font-head)" }}
                  >
                    {section.label}
                  </p>
                  <p className="text-[11px] leading-relaxed text-[var(--rt-text)]">
                    {report[section.key]}
                  </p>
                </div>
              ))}
              <TurkishExport
                topicTitle={topicTitle}
                topicFull={topicFull}
                summaries={summaries}
                report={report}
                messages={messages}
                disabled={disabled}
              />
            </div>
          )}
        </section>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="flex min-h-0 flex-col" aria-label="Türk Stratejik Gözlemci analiz paneli">
        {content}
      </div>
    );
  }

  return (
    <aside
      className={cn("flex min-h-0 flex-col", viewMode === "turkish_only" && "lg:col-span-2")}
      aria-label="Türk Stratejik Gözlemci analiz paneli"
    >
      {content}
    </aside>
  );
}
