"use client";

import type { RoundTableChatMessage, ThinkTankAnalysis } from "@/components/roundtable/types";
import {
  buildDebateMarkdown,
  buildPolicyMemoMarkdown,
  buildResearchBriefMarkdown,
  downloadTextFile,
  markdownToPrintHtml,
  openPrintView,
} from "@/lib/roundtable-export";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Printer, ScrollText } from "lucide-react";

type Props = {
  topicTitle: string;
  topicFull?: string;
  messages: RoundTableChatMessage[];
  analysis: ThinkTankAnalysis | null;
  participantNames: string[];
  disabled?: boolean;
};

export function DebateExport({
  topicTitle,
  topicFull,
  messages,
  analysis,
  participantNames,
  disabled,
}: Props) {
  if (messages.length === 0) return null;

  const slug = topicTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const baseParams = {
    topicTitle,
    topicFull,
    messages,
    analysis,
    participantNames,
  };

  const handleMarkdown = () => {
    const md = buildDebateMarkdown(baseParams);
    downloadTextFile(`roundtable-${slug || "debate"}.md`, md);
  };

  const handleResearchBrief = () => {
    if (!analysis) return;
    const md = buildResearchBriefMarkdown({ topicTitle, analysis, messages });
    downloadTextFile(`research-brief-${slug || "debate"}.md`, md);
  };

  const handlePolicyMemo = () => {
    if (!analysis) return;
    const md = buildPolicyMemoMarkdown({ topicTitle, analysis });
    downloadTextFile(`policy-memo-${slug || "debate"}.md`, md);
  };

  const handlePdf = () => {
    const md = buildDebateMarkdown(baseParams);
    const html = markdownToPrintHtml(md.replace(/\n/g, "\n"));
    openPrintView(`<div>${html}</div>`, `Round Table — ${topicTitle}`);
  };

  const hasAnalysis = Boolean(analysis);

  return (
    <div
      className="flex flex-wrap gap-2 border-t px-4 py-2 md:px-5"
      style={{ borderColor: "var(--rt-border)" }}
      role="group"
      aria-label="Export debate"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleMarkdown}
        className="border-[var(--rt-border)] text-[11px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
        aria-label="Export transcript and analysis as Markdown"
      >
        <FileDown className="mr-1 h-3.5 w-3.5" aria-hidden />
        Markdown
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !hasAnalysis}
        onClick={handleResearchBrief}
        className="border-[var(--rt-border)] text-[11px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
        aria-label="Export research brief"
      >
        <ScrollText className="mr-1 h-3.5 w-3.5" aria-hidden />
        Research Brief
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !hasAnalysis}
        onClick={handlePolicyMemo}
        className="border-[var(--rt-border)] text-[11px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
        aria-label="Export policy memo"
      >
        <FileText className="mr-1 h-3.5 w-3.5" aria-hidden />
        Policy Memo
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handlePdf}
        className="border-[var(--rt-border)] text-[11px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]"
        aria-label="Print or save as PDF"
      >
        <Printer className="mr-1 h-3.5 w-3.5" aria-hidden />
        PDF / Print
      </Button>
    </div>
  );
}
