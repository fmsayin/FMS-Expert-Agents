"use client";

import { useMemo } from "react";
import type { HistoricalFigure } from "@/data/historical-figures";
import { sortHistoricalFiguresByName } from "@/lib/figure-sort";
import {
  activeParticipantCardClassName,
  expertiseTagClassName,
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
import { cn } from "@/lib/utils";
import { BookOpen, Info, X } from "lucide-react";

type Props = {
  figures: HistoricalFigure[];
  onRemove: (id: string) => void;
  onViewProfile?: (figure: HistoricalFigure) => void;
  onOpenKnowledge?: (figure: HistoricalFigure) => void;
  variant?: "default" | "compact";
};

export function ActiveParticipants({
  figures,
  onRemove,
  onViewProfile,
  onOpenKnowledge,
  variant = "default",
}: Props) {
  const sortedFigures = useMemo(
    () => sortHistoricalFiguresByName(figures),
    [figures],
  );

  if (sortedFigures.length === 0) return null;

  const isCompact = variant === "compact";

  return (
    <section
      className={cn(
        "rt-participants border-b",
        isCompact ? "px-3 py-1" : "px-4 py-2.5 md:px-5",
      )}
      style={{
        borderColor: "var(--rt-border)",
        backgroundColor: isCompact
          ? "transparent"
          : "color-mix(in srgb, var(--rt-surface) 88%, var(--rt-bg))",
        boxShadow: isCompact
          ? undefined
          : "inset 0 1px 0 color-mix(in srgb, #fff 25%, transparent)",
      }}
      aria-label="Active participants"
    >
      <h3
        className={cn(
          "font-semibold uppercase tracking-[0.2em] text-[var(--rt-muted)]",
          isCompact ? "mb-1 text-[9px]" : "mb-2 text-[10px]",
        )}
        style={{ fontFamily: "var(--rt-font-head)" }}
      >
        Active Participants
      </h3>
      <div className={cn("flex flex-wrap gap-2", isCompact && "gap-1.5")}>
        {sortedFigures.map((figure) => {
          const canRemove = sortedFigures.length > 1;
          return (
            <div
              key={figure.id}
              className={activeParticipantCardClassName(isCompact)}
            >
              <button
                type="button"
                onClick={() => canRemove && onRemove(figure.id)}
                disabled={!canRemove}
                aria-label={
                  canRemove
                    ? `Remove ${figure.name} from round table`
                    : `${figure.name} — at least one participant required`
                }
                className={cn(
                  "flex min-w-0 flex-1 gap-2 text-left",
                  isCompact ? "items-center gap-2" : "items-start gap-2.5",
                  canRemove && "cursor-pointer",
                  !canRemove && "cursor-default opacity-95",
                )}
              >
                <span
                  className={figurePortraitClassName(isCompact ? "sm" : "md")}
                  style={{
                    background: figurePortraitGradient(figure.id),
                    fontFamily: "var(--rt-font-head)",
                    ...figurePortraitStyle(true),
                  }}
                  aria-hidden
                >
                  {figure.initials}
                </span>
                <span className={figureCardMetaStackClassName()}>
                  <span className={figureNameEraGroupClassName()}>
                    <span
                      className={figureNameClassName(isCompact)}
                      style={{ fontFamily: "var(--rt-font-head)" }}
                    >
                      {figure.name}
                    </span>
                    <span
                      className={figureEraClassName(isCompact)}
                      style={{
                        fontFamily: "var(--rt-font-body)",
                        ...figureEraStyle(),
                      }}
                    >
                      {figure.era}
                    </span>
                  </span>
                  {!isCompact && (
                    <span
                      className={cn(figureRoleClassName(), "mt-1")}
                      style={{ fontFamily: "var(--rt-font-body)" }}
                    >
                      {figure.role}
                    </span>
                  )}
                  {figure.expertiseTags.length > 0 && (
                    <span
                      className={cn(
                        "flex flex-wrap gap-0.5",
                        isCompact ? "mt-1" : "mt-1.5",
                      )}
                    >
                      {figure.expertiseTags
                        .slice(0, isCompact ? 2 : 3)
                        .map((tag) => (
                          <span
                            key={tag}
                            className={expertiseTagClassName(
                              isCompact ? "xs" : "sm",
                            )}
                            style={{ fontFamily: "var(--rt-font-body)" }}
                          >
                            {tag}
                          </span>
                        ))}
                    </span>
                  )}
                </span>
                {canRemove && !isCompact && (
                  <X
                    className="h-4 w-4 shrink-0 text-[var(--rt-muted)] opacity-0 transition-opacity group-hover:opacity-70"
                    aria-hidden
                  />
                )}
              </button>
              {(onOpenKnowledge || onViewProfile) && (
                <div className="absolute right-1 top-1 flex gap-0.5">
                  {onOpenKnowledge && (
                    <button
                      type="button"
                      onClick={() => onOpenKnowledge(figure)}
                      className="rounded-sm p-0.5 text-[var(--rt-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--rt-surface)_80%,var(--rt-bg))] hover:text-[var(--rt-accent)]"
                      title="Knowledge"
                      aria-label={`Knowledge for ${figure.name}`}
                    >
                      <BookOpen className="h-3 w-3" aria-hidden />
                    </button>
                  )}
                  {onViewProfile && (
                    <button
                      type="button"
                      onClick={() => onViewProfile(figure)}
                      className="rounded-sm p-0.5 text-[var(--rt-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--rt-surface)_80%,var(--rt-bg))] hover:text-[var(--rt-accent)]"
                      aria-label={`View profile for ${figure.name}`}
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
