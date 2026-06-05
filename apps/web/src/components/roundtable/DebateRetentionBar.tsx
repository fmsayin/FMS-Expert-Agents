"use client";

import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, NotebookPen, PauseCircle } from "lucide-react";

type Props = {
  bookmarked: boolean;
  onBookmark: () => void;
  onAddNotes: () => void;
  onContinueLater: () => void;
  disabled?: boolean;
};

export function DebateRetentionBar({
  bookmarked,
  onBookmark,
  onAddNotes,
  onContinueLater,
  disabled,
}: Props) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 border-t px-4 py-2 md:px-5"
      style={{
        borderColor: "var(--rt-border)",
        backgroundColor: "color-mix(in srgb, var(--rt-accent) 4%, var(--rt-surface))",
      }}
      role="toolbar"
      aria-label="Debate retention actions"
    >
      <span
        className="mr-1 text-[9px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
        style={{ fontFamily: "var(--rt-font-head)" }}
      >
        After debate
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={onBookmark}
        className="h-8 border-[var(--rt-border)] text-[10px] text-[var(--rt-text)] hover:border-[var(--rt-accent)]"
      >
        {bookmarked ? (
          <BookmarkCheck className="mr-1 h-3.5 w-3.5 text-[var(--rt-accent)]" aria-hidden />
        ) : (
          <Bookmark className="mr-1 h-3.5 w-3.5" aria-hidden />
        )}
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={onAddNotes}
        className="h-8 border-[var(--rt-border)] text-[10px] text-[var(--rt-text)] hover:border-[var(--rt-accent)]"
      >
        <NotebookPen className="mr-1 h-3.5 w-3.5" aria-hidden />
        Add Notes
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={onContinueLater}
        className="h-8 border-[var(--rt-border)] text-[10px] text-[var(--rt-text)] hover:border-[var(--rt-accent)]"
      >
        <PauseCircle className="mr-1 h-3.5 w-3.5" aria-hidden />
        Continue Later
      </Button>
    </div>
  );
}
