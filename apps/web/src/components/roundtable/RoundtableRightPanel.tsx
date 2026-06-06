"use client";

import { CustomFigureForm } from "@/components/roundtable/CustomFigureForm";
import { FigureSelector } from "@/components/roundtable/FigureSelector";
import { ResearchOutputActions } from "@/components/roundtable/ResearchOutputActions";
import { ThinkTankOutputs } from "@/components/roundtable/ThinkTankOutputs";
import { TurkishAnalysisPanel } from "@/components/roundtable/TurkishAnalysisPanel";
import { TurkishModeToggle } from "@/components/roundtable/TurkishModeToggle";
import type {
  RoundTableChatMessage,
  RoundtableRightTab,
  ThinkTankAnalysis,
  TurkishExecutiveReport,
  TurkishSummaryEntry,
  TurkishViewMode,
} from "@/components/roundtable/types";
import {
  addCustomFigure,
  deleteCustomFigure,
  updateCustomFigure,
  type CustomFigure,
  type CustomFigureInput,
} from "@/lib/custom-figures-storage";
import { HISTORICAL_FIGURES } from "@/data/historical-figures";
import { sortCustomFiguresByName } from "@/lib/figure-sort";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  activeTab: RoundtableRightTab;
  onTabChange: (tab: RoundtableRightTab) => void;
  reportsBadge: boolean;
  onReportsTabViewed: () => void;
  activeFigureIds: string[];
  customFigures: CustomFigure[];
  onCustomFiguresChange: (figures: CustomFigure[]) => void;
  onToggleFigure: (id: string) => void;
  onCustomFigureDeleted: (storageId: string) => void;
  turkishMode: TurkishViewMode;
  onTurkishModeChange: (mode: TurkishViewMode) => void;
  turkishSummaries: TurkishSummaryEntry[];
  turkishReport: TurkishExecutiveReport | null;
  isTurkishReportLoading: boolean;
  turkishReportError: string | null;
  onGenerateTurkishReport: () => void;
  canGenerateTurkishReport: boolean;
  topicTitle: string;
  topicFull: string;
  messages: RoundTableChatMessage[];
  analysis: ThinkTankAnalysis | null;
  isAnalyzeLoading: boolean;
  isIncrementalAnalyze: boolean;
  analysisIsPlaceholder: boolean;
  onGenerateAnalysis: () => void;
  canGenerateAnalysis: boolean;
  analyzeDisabledReason?: string | null;
  isDebateLoading: boolean;
  disabled?: boolean;
  participantNames: string[];
  sessionId: string | null;
  showTurkishInReports: boolean;
};

const TABS: { id: RoundtableRightTab; label: string }[] = [
  { id: "participants", label: "Participants" },
  { id: "observer", label: "Observer" },
  { id: "reports", label: "Reports" },
];

export function RoundtableRightPanel({
  activeTab,
  onTabChange,
  reportsBadge,
  onReportsTabViewed,
  activeFigureIds,
  customFigures,
  onCustomFiguresChange,
  onToggleFigure,
  onCustomFigureDeleted,
  turkishMode,
  onTurkishModeChange,
  turkishSummaries,
  turkishReport,
  isTurkishReportLoading,
  turkishReportError,
  onGenerateTurkishReport,
  canGenerateTurkishReport,
  topicTitle,
  topicFull,
  messages,
  analysis,
  isAnalyzeLoading,
  isIncrementalAnalyze,
  analysisIsPlaceholder,
  onGenerateAnalysis,
  canGenerateAnalysis,
  analyzeDisabledReason,
  isDebateLoading,
  disabled,
  participantNames,
  sessionId,
  showTurkishInReports,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingFigure, setEditingFigure] = useState<CustomFigure | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const builtInFigureCount = HISTORICAL_FIGURES.length;
  const totalFigureCount = builtInFigureCount + customFigures.length;

  const handleTab = (tab: RoundtableRightTab) => {
    onTabChange(tab);
    if (tab === "reports") onReportsTabViewed();
  };

  const handleSaveCustom = (input: CustomFigureInput, editingId: string | null) => {
    if (editingId) {
      const updated = updateCustomFigure(editingId, input);
      if (updated) {
        onCustomFiguresChange(
          sortCustomFiguresByName(
            customFigures.map((f) => (f.id === editingId ? updated : f)),
          ),
        );
        setSaveNotice(`Updated ${updated.fullName}`);
      }
    } else {
      const created = addCustomFigure(input);
      onCustomFiguresChange(sortCustomFiguresByName([...customFigures, created]));
      setSaveNotice(`Saved ${created.fullName}`);
    }
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDeleteCustom = (figure: CustomFigure) => {
    if (!deleteCustomFigure(figure.id)) return;
    onCustomFiguresChange(customFigures.filter((f) => f.id !== figure.id));
    onCustomFigureDeleted(`custom-${figure.id}`);
  };

  const updatingConsensus = isAnalyzeLoading || isIncrementalAnalyze;

  return (
    <aside
      className="flex min-h-0 w-full flex-col border-t lg:sticky lg:top-0 lg:max-h-[min(720px,calc(100vh-8rem))] lg:w-[368px] lg:shrink-0 lg:self-start lg:border-t-0 lg:border-l"
      style={{
        borderColor: "var(--rt-border)",
        backgroundColor: "var(--rt-surface)",
      }}
      aria-label="Round table workspace panel"
    >
      <div
        className="flex shrink-0 border-b"
        style={{ borderColor: "var(--rt-border)" }}
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTab(tab.id)}
            className={cn(
              "relative flex-1 px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
              activeTab === tab.id
                ? "text-[var(--rt-accent)]"
                : "text-[var(--rt-muted)] hover:text-[var(--rt-text)]",
            )}
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            {tab.id === "participants" ? (
              <>
                Participants{" "}
                <span
                  className="font-normal normal-case tracking-normal text-[var(--rt-muted)]"
                  aria-label={`${totalFigureCount} figures available`}
                >
                  ({totalFigureCount})
                </span>
              </>
            ) : (
              tab.label
            )}
            {tab.id === "reports" && reportsBadge && (
              <span
                className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--rt-accent)]"
                aria-label="New analysis available"
              />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "participants" && (
          <div className="flex min-h-0 flex-col" role="tabpanel">
            {saveNotice && (
              <p
                className="shrink-0 border-b px-3 py-1.5 text-[10px] text-[var(--rt-accent)]"
                style={{ borderColor: "var(--rt-border)" }}
                role="status"
              >
                {saveNotice}
              </p>
            )}
            <FigureSelector
              variant="panel"
              activeFigureIds={activeFigureIds}
              customFigures={customFigures}
              onToggleFigure={onToggleFigure}
              onAddCustomFigure={() => {
                setEditingFigure(null);
                setFormOpen(true);
              }}
              onEditCustomFigure={(f) => {
                setEditingFigure(f);
                setFormOpen(true);
              }}
              onDeleteCustomFigure={handleDeleteCustom}
            />
            <CustomFigureForm
              open={formOpen}
              editingFigure={editingFigure}
              onOpenChange={setFormOpen}
              onSave={handleSaveCustom}
            />
          </div>
        )}

        {activeTab === "observer" && (
          <div role="tabpanel" className="flex min-h-0 flex-col">
            <div
              className="shrink-0 border-b px-3 py-2"
              style={{ borderColor: "var(--rt-border)" }}
            >
              <TurkishModeToggle mode={turkishMode} onModeChange={onTurkishModeChange} />
            </div>
            <TurkishAnalysisPanel
              embedded
              summaries={turkishSummaries}
              report={turkishReport}
              isReportLoading={isTurkishReportLoading}
              reportError={turkishReportError}
              onGenerateReport={onGenerateTurkishReport}
              canGenerateReport={canGenerateTurkishReport}
              viewMode={turkishMode}
              topicTitle={topicTitle}
              topicFull={topicFull}
              messages={messages}
              disabled={disabled}
            />
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-0 p-0" role="tabpanel">
            {updatingConsensus && (
              <div
                className="flex items-center gap-2 border-b px-3 py-2 text-[10px] text-[var(--rt-accent)]"
                style={{ borderColor: "var(--rt-border)" }}
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Updating consensus…
              </div>
            )}
            <ThinkTankOutputs
              embedded
              analysis={analysis}
              isLoading={isAnalyzeLoading && !isIncrementalAnalyze}
              isPlaceholder={analysisIsPlaceholder}
              onGenerate={onGenerateAnalysis}
              canGenerate={canGenerateAnalysis}
              disabledReason={analyzeDisabledReason}
              turkishReport={showTurkishInReports ? turkishReport : null}
              showTurkishSample={showTurkishInReports && !turkishReport}
            />
            <div className="border-t px-3 py-3" style={{ borderColor: "var(--rt-border)" }}>
              <ResearchOutputActions
                topicTitle={topicTitle}
                topicFull={topicFull}
                messages={messages}
                analysis={analysis}
                participantNames={participantNames}
                sessionId={sessionId}
                disabled={disabled || isDebateLoading}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
