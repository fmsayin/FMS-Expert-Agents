"use client";

import { useMemo, useState, type ReactNode } from "react";
import { HISTORICAL_FIGURES } from "@/data/historical-figures";
import type { HistoricalFigure } from "@/data/historical-figures";
import { FigureKnowledgePanel } from "@/components/roundtable/FigureKnowledgePanel";
import { FigureProfilePanel } from "@/components/roundtable/FigureProfilePanel";
import {
  expertiseTagClassName,
  figureCardClassName,
  figureCardMetaStackClassName,
  figureEraClassName,
  figureEraStyle,
  figureNameClassName,
  figureNameEraGroupClassName,
  figurePortraitClassName,
  figurePortraitGradient,
  figurePortraitStyle,
  figureRoleClassName,
} from "@/components/roundtable/figure-portrait";
import { customFigureToHistoricalFigure } from "@/lib/roundtable-figures";
import type { CustomFigure } from "@/lib/custom-figures-storage";
import { sortCustomFiguresByName } from "@/lib/figure-sort";
import { cn } from "@/lib/utils";
import { BookOpen, Info, Pencil, Plus, Trash2 } from "lucide-react";

type Props = {
  activeFigureIds: string[];
  customFigures: CustomFigure[];
  onToggleFigure: (id: string) => void;
  onAddCustomFigure: () => void;
  onEditCustomFigure: (figure: CustomFigure) => void;
  onDeleteCustomFigure: (figure: CustomFigure) => void;
  variant?: "compact" | "panel";
};

function FigureCard({
  figure,
  active,
  onToggle,
  onViewProfile,
  onOpenKnowledge,
  actions,
}: {
  figure: HistoricalFigure;
  active: boolean;
  onToggle: () => void;
  onViewProfile: () => void;
  onOpenKnowledge: () => void;
  actions?: ReactNode;
}) {
  return (
    <div
      className={figureCardClassName(active)}
      style={{ fontFamily: "var(--rt-font-body)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-start gap-2.5 rounded-md pr-[4.25rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rt-accent)_50%,var(--rt-border))] focus-visible:ring-offset-1"
        aria-pressed={active}
        aria-label={`${figure.name}, ${figure.era}. ${figure.role}. ${active ? "Selected" : "Not selected"}`}
      >
        <span
          className={figurePortraitClassName("md")}
          style={{
            background: figurePortraitGradient(figure.id),
            fontFamily: "var(--rt-font-head)",
            ...figurePortraitStyle(active),
          }}
          aria-hidden
        >
          {figure.initials}
        </span>
        <span className={figureCardMetaStackClassName()}>
          <span className={figureNameEraGroupClassName()}>
            <span
              className={figureNameClassName()}
              style={{ fontFamily: "var(--rt-font-head)" }}
            >
              {figure.name}
            </span>
            <span
              className={figureEraClassName()}
              style={{
                fontFamily: "var(--rt-font-body)",
                ...figureEraStyle(),
              }}
            >
              {figure.era}
            </span>
          </span>
          <span
            className={cn(figureRoleClassName(), "mt-1")}
            style={{ fontFamily: "var(--rt-font-body)" }}
          >
            {figure.role}
          </span>
          {figure.expertiseTags.length > 0 && (
            <span className="mt-1.5 flex flex-wrap gap-1">
              {figure.expertiseTags.map((tag) => (
                <span
                  key={tag}
                  className={expertiseTagClassName("sm")}
                  style={{ fontFamily: "var(--rt-font-body)" }}
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
        </span>
      </button>
      <div className="absolute right-1.5 top-1.5 flex shrink-0 gap-0.5">
        {actions}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenKnowledge();
          }}
          className="rounded p-1 text-[var(--rt-muted)] hover:bg-[var(--rt-bg)] hover:text-[var(--rt-accent)]"
          title="Knowledge"
          aria-label={`Knowledge base for ${figure.name}`}
        >
          <BookOpen className="h-3 w-3" aria-hidden />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile();
          }}
          className="rounded p-1 text-[var(--rt-muted)] hover:bg-[var(--rt-bg)] hover:text-[var(--rt-accent)]"
          aria-label={`View profile for ${figure.name}`}
        >
          <Info className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function FigureSelector({
  activeFigureIds,
  customFigures,
  onToggleFigure,
  onAddCustomFigure,
  onEditCustomFigure,
  onDeleteCustomFigure,
  variant = "compact",
}: Props) {
  const isPanel = variant === "panel";
  const totalFigureCount = HISTORICAL_FIGURES.length + customFigures.length;
  const sortedCustomFigures = useMemo(
    () => sortCustomFiguresByName(customFigures),
    [customFigures],
  );
  const [profileFigure, setProfileFigure] = useState<HistoricalFigure | null>(null);
  const [knowledgeFigure, setKnowledgeFigure] = useState<HistoricalFigure | null>(null);

  const handleDelete = (custom: CustomFigure, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Delete "${custom.fullName}"? This cannot be undone.`,
    );
    if (confirmed) onDeleteCustomFigure(custom);
  };

  return (
    <>
      <div
        className={cn(
          "flex min-h-0 flex-col p-3",
          !isPanel && "border-t border-[var(--rt-border)]",
          isPanel && "h-full",
        )}
      >
        <p
          className="mb-1 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
          style={{ fontFamily: "var(--rt-font-head)" }}
        >
          Figures at the Table
          <span className="ml-1 font-normal normal-case tracking-normal opacity-80">
            ({totalFigureCount})
          </span>
        </p>
        <p
          className="mb-3 shrink-0 text-[10px] text-[var(--rt-muted)]"
          style={{ fontFamily: "var(--rt-font-body)" }}
        >
          Select debate participants
        </p>

        <button
          type="button"
          onClick={onAddCustomFigure}
          className={cn(
            "mb-3 flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-[11px] font-medium transition-colors",
            "border-[var(--rt-border)] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-accent)]",
          )}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add custom figure
        </button>

        <div
          className={cn(
            "min-h-0 overflow-y-auto pr-1",
            isPanel ? "flex-1" : "max-h-[min(280px,40vh)]",
          )}
        >
          {sortedCustomFigures.length > 0 && (
            <div className="mb-3">
              <p
                className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--rt-accent)]"
                style={{ fontFamily: "var(--rt-font-head)" }}
              >
                Your figures
              </p>
              <div className={cn("grid gap-2", isPanel ? "grid-cols-1" : "grid-cols-2")}>
                {sortedCustomFigures.map((custom) => {
                  const figure = customFigureToHistoricalFigure(custom);
                  const active = activeFigureIds.includes(figure.id);
                  return (
                    <FigureCard
                      key={figure.id}
                      figure={figure}
                      active={active}
                      onToggle={() => onToggleFigure(figure.id)}
                      onViewProfile={() => setProfileFigure(figure)}
                      onOpenKnowledge={() => setKnowledgeFigure(figure)}
                      actions={
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCustomFigure(custom);
                            }}
                            className="rounded p-1 text-[var(--rt-muted)] hover:bg-[var(--rt-bg)] hover:text-[var(--rt-accent)]"
                            aria-label={`Edit ${custom.fullName}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(custom, e)}
                            className="rounded p-1 text-[var(--rt-muted)] hover:bg-[var(--rt-bg)] hover:text-[var(--rt-accent)]"
                            aria-label={`Delete ${custom.fullName}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}

          <p
            className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Historical figures
          </p>
          <div className={cn("grid gap-2", isPanel ? "grid-cols-1" : "grid-cols-2")}>
            {HISTORICAL_FIGURES.map((figure) => {
              const active = activeFigureIds.includes(figure.id);
              return (
                <FigureCard
                  key={figure.id}
                  figure={figure}
                  active={active}
                  onToggle={() => onToggleFigure(figure.id)}
                  onViewProfile={() => setProfileFigure(figure)}
                  onOpenKnowledge={() => setKnowledgeFigure(figure)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <FigureKnowledgePanel
        open={knowledgeFigure !== null}
        onOpenChange={(open) => {
          if (!open) setKnowledgeFigure(null);
        }}
        figure={knowledgeFigure}
      />

      <FigureProfilePanel
        open={profileFigure !== null}
        onOpenChange={(open) => {
          if (!open) setProfileFigure(null);
        }}
        figure={profileFigure}
        customFigures={customFigures}
      />
    </>
  );
}
