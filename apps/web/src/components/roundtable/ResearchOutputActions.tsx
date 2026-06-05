"use client";

import { useState } from "react";
import type { RoundTableChatMessage, ThinkTankAnalysis } from "@/components/roundtable/types";
import { AddToProjectModal } from "@/components/roundtable/AddToProjectModal";
import { Button } from "@/components/ui/button";
import { addKnowledgeBaseEntry } from "@/lib/knowledge-base-storage";
import {
  buildDebateMarkdown,
  buildExecutiveSummaryMarkdown,
  buildPolicyMemoMarkdown,
  buildResearchBriefMarkdown,
  downloadTextFile,
  markdownToPrintHtml,
  openPrintView,
} from "@/lib/roundtable-export";
import {
  BookMarked,
  FileDown,
  FileText,
  FolderPlus,
  Library,
  Printer,
  ScrollText,
} from "lucide-react";
import Link from "next/link";

type Props = {
  topicTitle: string;
  topicFull?: string;
  messages: RoundTableChatMessage[];
  analysis: ThinkTankAnalysis | null;
  participantNames: string[];
  sessionId?: string | null;
  disabled?: boolean;
  onSavedToKnowledge?: () => void;
};

export function ResearchOutputActions({
  topicTitle,
  topicFull,
  messages,
  analysis,
  participantNames,
  sessionId,
  disabled,
  onSavedToKnowledge,
}: Props) {
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (messages.length === 0) return null;

  const slug = topicTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const baseParams = { topicTitle, topicFull, messages, analysis, participantNames };
  const hasAnalysis = Boolean(analysis);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleKnowledge = (type: "roundtable-debate" | "roundtable-brief" | "roundtable-memo" | "roundtable-summary") => {
    if (!analysis && type !== "roundtable-debate") return;
    let content = buildDebateMarkdown(baseParams);
    if (type === "roundtable-brief") content = buildResearchBriefMarkdown({ topicTitle, analysis: analysis!, messages });
    if (type === "roundtable-memo") content = buildPolicyMemoMarkdown({ topicTitle, analysis: analysis! });
    if (type === "roundtable-summary")
      content = buildExecutiveSummaryMarkdown({ topicTitle, analysis: analysis!, participantNames });
    addKnowledgeBaseEntry({
      title: topicTitle,
      type,
      content,
      sourceSessionId: sessionId ?? undefined,
    });
    showNotice("Added to Knowledge Base");
    onSavedToKnowledge?.();
  };

  const btnClass =
    "h-8 border-[var(--rt-border)] text-[10px] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]";

  return (
    <div className="space-y-2" role="group" aria-label="Research output actions">
      {notice && (
        <p className="text-[10px] text-[var(--rt-accent)]" role="status">
          {notice}
        </p>
      )}
      <p
        className="text-[9px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
        style={{ fontFamily: "var(--rt-font-head)" }}
      >
        Export &amp; Save
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => downloadTextFile(`roundtable-${slug || "debate"}.md`, buildDebateMarkdown(baseParams))} className={btnClass}>
          <FileDown className="mr-1 h-3 w-3" aria-hidden />
          Markdown
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={disabled || !hasAnalysis} onClick={() => downloadTextFile(`research-brief-${slug}.md`, buildResearchBriefMarkdown({ topicTitle, analysis: analysis!, messages }))} className={btnClass}>
          <ScrollText className="mr-1 h-3 w-3" aria-hidden />
          Research Brief
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={disabled || !hasAnalysis} onClick={() => downloadTextFile(`policy-memo-${slug}.md`, buildPolicyMemoMarkdown({ topicTitle, analysis: analysis! }))} className={btnClass}>
          <FileText className="mr-1 h-3 w-3" aria-hidden />
          Policy Memo
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={disabled || !hasAnalysis} onClick={() => downloadTextFile(`executive-summary-${slug}.md`, buildExecutiveSummaryMarkdown({ topicTitle, analysis: analysis!, participantNames }))} className={btnClass}>
          <BookMarked className="mr-1 h-3 w-3" aria-hidden />
          Exec Summary
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => {
            const md = buildDebateMarkdown(baseParams);
            openPrintView(`<div>${markdownToPrintHtml(md.replace(/\n/g, "\n"))}</div>`, `Round Table — ${topicTitle}`);
          }}
          className={btnClass}
        >
          <Printer className="mr-1 h-3 w-3" aria-hidden />
          PDF
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => handleKnowledge("roundtable-debate")} className={btnClass}>
          <Library className="mr-1 h-3 w-3" aria-hidden />
          Knowledge Base
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={disabled || !sessionId} onClick={() => setProjectModalOpen(true)} className={btnClass}>
          <FolderPlus className="mr-1 h-3 w-3" aria-hidden />
          Add to Project
        </Button>
      </div>
      <p className="text-[9px] text-[var(--rt-muted)]">
        Knowledge Base:{" "}
        <Link href="/knowledge" className="underline hover:text-[var(--rt-accent)]">
          /knowledge
        </Link>{" "}
        (stub)
      </p>
      {sessionId && (
        <AddToProjectModal
          open={projectModalOpen}
          onOpenChange={setProjectModalOpen}
          sessionId={sessionId}
          onAdded={() => showNotice("Added to project")}
        />
      )}
    </div>
  );
}
