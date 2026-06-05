"use client";

import { useState } from "react";
import type {
  RoundTableChatMessage,
  ThinkTankAnalysis,
  TurkishExecutiveReport,
  TurkishSummaryEntry,
} from "@/components/roundtable/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildDebateMarkdown,
  buildExecutiveSummaryMarkdown,
  buildPolicyMemoMarkdown,
  buildResearchBriefMarkdown,
  downloadTextFile,
  markdownToPrintHtml,
  openPrintView,
} from "@/lib/roundtable-export";
import { buildTurkishDebateMarkdown } from "@/lib/turkish-roundtable-export";
import {
  BookMarked,
  Download,
  FileDown,
  FileText,
  Printer,
  Save,
  ScrollText,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  topicTitle: string;
  topicFull?: string;
  messages: RoundTableChatMessage[];
  analysis: ThinkTankAnalysis | null;
  participantNames: string[];
  turkishReport?: TurkishExecutiveReport | null;
  turkishSummaries?: TurkishSummaryEntry[];
  onSaveDebate: () => void;
  disabled?: boolean;
};

export function DebateCompleteActions({
  topicTitle,
  topicFull,
  messages,
  analysis,
  participantNames,
  turkishReport,
  turkishSummaries = [],
  onSaveDebate,
  disabled,
}: Props) {
  const [exportOpen, setExportOpen] = useState(false);

  const slug = topicTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const baseParams = { topicTitle, topicFull, messages, analysis, participantNames };
  const hasAnalysis = Boolean(analysis);

  const handleSave = () => {
    onSaveDebate();
    toast.success("Debate saved");
  };

  const buildCombinedReport = () => {
    let md = buildDebateMarkdown(baseParams);
    if (turkishReport) {
      md += `\n\n---\n\n${buildTurkishDebateMarkdown({
        topicTitle,
        topicFull,
        summaries: turkishSummaries,
        report: turkishReport,
      })}`;
    }
    return md;
  };

  const handleQuickExport = () => {
    downloadTextFile(`roundtable-report-${slug || "debate"}.md`, buildCombinedReport());
    setExportOpen(false);
  };

  const btnOutline =
    "h-9 w-full justify-start border-[var(--rt-border)] text-[11px] text-[var(--rt-text)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]";

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-3 border-t px-4 py-3 md:px-5"
        style={{
          borderColor: "var(--rt-border)",
          backgroundColor: "color-mix(in srgb, var(--rt-accent) 6%, var(--rt-surface))",
        }}
        role="toolbar"
        aria-label="Debate complete actions"
      >
        <Button
          type="button"
          size="sm"
          disabled={disabled}
          onClick={handleSave}
          className="h-9 border border-[var(--rt-accent)] bg-[var(--rt-accent)] px-4 text-[11px] font-semibold text-[var(--rt-bg)] hover:bg-[var(--rt-accent)]/90"
          style={{ fontFamily: "var(--rt-font-head)" }}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Save Debate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => setExportOpen(true)}
          className="h-9 border-[var(--rt-border)] px-4 text-[11px] text-[var(--rt-text)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
          style={{ fontFamily: "var(--rt-font-head)" }}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Export Report
        </Button>
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent
          className="border-[var(--rt-border)] bg-[var(--rt-surface)] text-[var(--rt-text)]"
          style={{ fontFamily: "var(--rt-font-body)" }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[var(--rt-text)]"
              style={{ fontFamily: "var(--rt-font-head)" }}
            >
              Export Report
            </DialogTitle>
            <DialogDescription className="text-[var(--rt-muted)]">
              Download transcript, think tank analysis
              {turkishReport ? ", and Turkish report" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={handleQuickExport}
              className={btnOutline}
            >
              <FileDown className="mr-2 h-3.5 w-3.5" aria-hidden />
              Full Report (Markdown)
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                const md = buildDebateMarkdown(baseParams);
                openPrintView(
                  `<div>${markdownToPrintHtml(md.replace(/\n/g, "\n"))}</div>`,
                  `Round Table — ${topicTitle}`,
                );
                setExportOpen(false);
              }}
              className={btnOutline}
            >
              <Printer className="mr-2 h-3.5 w-3.5" aria-hidden />
              PDF / Print
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || !hasAnalysis}
              onClick={() => {
                downloadTextFile(
                  `research-brief-${slug}.md`,
                  buildResearchBriefMarkdown({ topicTitle, analysis: analysis!, messages }),
                );
                setExportOpen(false);
              }}
              className={btnOutline}
            >
              <ScrollText className="mr-2 h-3.5 w-3.5" aria-hidden />
              Research Brief
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || !hasAnalysis}
              onClick={() => {
                downloadTextFile(
                  `policy-memo-${slug}.md`,
                  buildPolicyMemoMarkdown({ topicTitle, analysis: analysis! }),
                );
                setExportOpen(false);
              }}
              className={btnOutline}
            >
              <FileText className="mr-2 h-3.5 w-3.5" aria-hidden />
              Policy Memo
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || !hasAnalysis}
              onClick={() => {
                downloadTextFile(
                  `executive-summary-${slug}.md`,
                  buildExecutiveSummaryMarkdown({ topicTitle, analysis: analysis!, participantNames }),
                );
                setExportOpen(false);
              }}
              className={btnOutline}
            >
              <BookMarked className="mr-2 h-3.5 w-3.5" aria-hidden />
              Executive Summary
            </Button>
            {turkishReport && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => {
                  downloadTextFile(
                    `turkce-rapor-${slug || "masa"}.md`,
                    buildTurkishDebateMarkdown({
                      topicTitle,
                      topicFull,
                      summaries: turkishSummaries,
                      report: turkishReport,
                    }),
                  );
                  setExportOpen(false);
                }}
                className={btnOutline}
              >
                <FileDown className="mr-2 h-3.5 w-3.5" aria-hidden />
                Turkish Report (Markdown)
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
