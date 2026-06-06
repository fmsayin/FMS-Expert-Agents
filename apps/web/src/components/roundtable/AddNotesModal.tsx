"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNotes: string;
  onSave: (notes: string) => void;
};

export function AddNotesModal({ open, onOpenChange, initialNotes, onSave }: Props) {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    if (open) setNotes(initialNotes);
  }, [open, initialNotes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "border-[var(--rt-border)] bg-[var(--rt-surface)] text-[var(--rt-text)] sm:max-w-lg",
        )}
        style={{ fontFamily: "var(--rt-font-body)" }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-[var(--rt-text)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Debate Notes
          </DialogTitle>
          <DialogDescription className="text-[var(--rt-muted)]">
            Private research notes saved with this session in your browser.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={8}
          placeholder="Key insights, follow-up questions, citations…"
          className={cn(
            "resize-y border-[var(--rt-border)] bg-[var(--rt-bg)] text-[var(--rt-text)]",
            "placeholder:text-[var(--rt-muted)] focus-visible:ring-[var(--rt-accent)]",
          )}
          style={{ fontFamily: "var(--rt-font-body)" }}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--rt-border)] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-text)]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave(notes);
              onOpenChange(false);
            }}
            className="border border-[var(--rt-accent)] bg-[var(--rt-accent)] text-[var(--rt-bg)] hover:bg-[var(--rt-accent)]/90"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Save notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
