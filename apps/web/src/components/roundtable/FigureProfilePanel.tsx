"use client";

import type { ReactNode } from "react";
import type { HistoricalFigure } from "@/data/historical-figures";
import type { CustomFigure } from "@/lib/custom-figures-storage";
import { isCustomFigureStorageId, parseCustomFigureUuid } from "@/lib/custom-figures-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  figure: HistoricalFigure | null;
  customFigures: CustomFigure[];
};

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  if (!children) return null;
  return (
    <section className="space-y-1">
      <h4
        className="text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
        style={{ fontFamily: "var(--rt-font-head)" }}
      >
        {title}
      </h4>
      <div
        className="text-[12px] leading-relaxed text-[var(--rt-text)]/90 whitespace-pre-wrap"
        style={{ fontFamily: "var(--rt-font-body)" }}
      >
        {children}
      </div>
    </section>
  );
}

export function FigureProfilePanel({
  open,
  onOpenChange,
  figure,
  customFigures,
}: Props) {
  if (!figure) return null;

  const customUuid = isCustomFigureStorageId(figure.id)
    ? parseCustomFigureUuid(figure.id)
    : null;
  const custom = customUuid
    ? customFigures.find((f) => f.id === customUuid)
    : undefined;

  const imageUrl = custom?.profileImageUrl?.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto border-[var(--rt-border)] bg-[var(--rt-surface)] text-[var(--rt-text)]",
          "sm:max-w-lg",
        )}
        style={{ fontFamily: "var(--rt-font-body)" }}
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-full border-2 border-[var(--rt-border)] object-cover"
              />
            ) : (
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--rt-accent)] bg-[var(--rt-accent)]/10 text-sm font-semibold text-[var(--rt-accent)]"
                style={{ fontFamily: "var(--rt-font-head)" }}
                aria-hidden
              >
                {figure.initials}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <DialogTitle
                className="text-left text-base text-[var(--rt-text)]"
                style={{ fontFamily: "var(--rt-font-head)" }}
              >
                {figure.name}
              </DialogTitle>
              <p className="mt-0.5 text-[11px] text-[var(--rt-muted)]">{figure.era}</p>
              <p
                className="mt-1 text-[12px] font-medium text-[var(--rt-text)]/85"
                style={{ fontFamily: "var(--rt-font-body)" }}
              >
                {figure.role}
              </p>
              {figure.expertiseTags.length > 0 && (
                <span className="mt-2 flex flex-wrap gap-1">
                  {figure.expertiseTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full border border-[var(--rt-border)] bg-[var(--rt-bg)]/80 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[var(--rt-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {custom ? (
            <>
              <ProfileSection title="Short description">
                {custom.shortDescription.trim() || null}
              </ProfileSection>
              <ProfileSection title="Biography">
                {custom.biography.trim() || null}
              </ProfileSection>
              <ProfileSection title="Historical context">
                {custom.historicalContext.trim() || null}
              </ProfileSection>
              <ProfileSection title="Key achievements">
                {custom.keyAchievements.trim() || null}
              </ProfileSection>
              <ProfileSection title="Leadership style">
                {custom.leadershipStyle.trim() || null}
              </ProfileSection>
              <ProfileSection title="Ideology & philosophy">
                {custom.ideologyPhilosophy.trim() || null}
              </ProfileSection>
              <ProfileSection title="Debate style">
                {custom.debateStyle.trim() || null}
              </ProfileSection>
              <ProfileSection title="Areas of expertise">
                {custom.expertise.trim() || null}
              </ProfileSection>
              <ProfileSection title="Notable quotes">
                {custom.notableQuotes.trim() || null}
              </ProfileSection>
            </>
          ) : (
            <ProfileSection title="Character & voice">{figure.style}</ProfileSection>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
