"use client";

import type {
  RoundTableChatMessage,
  TurkishExecutiveReport,
  TurkishSummaryEntry,
} from "@/components/roundtable/types";
import {
  buildTurkishDebateMarkdown,
  buildTurkishPolicyMemoMarkdown,
  buildTurkishResearchBriefMarkdown,
  downloadTextFile,
  printTurkishReport,
} from "@/lib/turkish-roundtable-export";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Printer, ScrollText } from "lucide-react";

type Props = {
  topicTitle: string;
  topicFull?: string;
  summaries: TurkishSummaryEntry[];
  report: TurkishExecutiveReport | null;
  messages: RoundTableChatMessage[];
  disabled?: boolean;
};

export function TurkishExport({
  topicTitle,
  topicFull,
  summaries,
  report,
  messages,
  disabled,
}: Props) {
  if (!report) return null;

  const slug = topicTitle
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const exchangeCount = messages.filter((m) => m.role === "assistant").length;

  const handleMarkdown = () => {
    const md = buildTurkishDebateMarkdown({
      topicTitle,
      topicFull,
      summaries,
      report,
    });
    downloadTextFile(`turkce-rapor-${slug || "masa"}.md`, md);
  };

  const handlePolicyMemo = () => {
    const md = buildTurkishPolicyMemoMarkdown({ topicTitle, report });
    downloadTextFile(`politika-notu-${slug || "masa"}.md`, md);
  };

  const handleResearchBrief = () => {
    const md = buildTurkishResearchBriefMarkdown({
      topicTitle,
      report,
      exchangeCount,
    });
    downloadTextFile(`arastirma-ozeti-${slug || "masa"}.md`, md);
  };

  const handlePdf = () => {
    printTurkishReport({ topicTitle, topicFull, summaries, report });
  };

  return (
    <div className="flex flex-wrap gap-1.5 pt-2" role="group" aria-label="Türkçe rapor dışa aktarma">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleMarkdown}
        className="h-7 border-[var(--rt-border)] px-2 text-[10px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
        aria-label="Markdown olarak indir"
      >
        <FileDown className="mr-1 h-3 w-3" aria-hidden />
        MD
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleResearchBrief}
        className="h-7 border-[var(--rt-border)] px-2 text-[10px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
        aria-label="Araştırma özeti indir"
      >
        <ScrollText className="mr-1 h-3 w-3" aria-hidden />
        Araştırma
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handlePolicyMemo}
        className="h-7 border-[var(--rt-border)] px-2 text-[10px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
        aria-label="Politika notu indir"
      >
        <FileText className="mr-1 h-3 w-3" aria-hidden />
        Politika
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handlePdf}
        className="h-7 border-[var(--rt-border)] px-2 text-[10px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
        aria-label="PDF yazdır"
      >
        <Printer className="mr-1 h-3 w-3" aria-hidden />
        PDF
      </Button>
    </div>
  );
}
