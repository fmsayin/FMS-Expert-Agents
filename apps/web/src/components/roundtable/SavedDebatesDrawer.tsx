"use client";

import { useEffect, useState } from "react";
import type { DebateSession } from "@/lib/debate-sessions-storage";
import { deleteDebateSession, listDebateSessions } from "@/lib/debate-sessions-storage";
import { sortDisplayNames } from "@/lib/figure-sort";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Archive, Bookmark, Trash2 } from "lucide-react";

const RT_DIALOG_CLASS =
  "max-h-[85vh] overflow-hidden border-[var(--rt-border)] bg-[var(--rt-surface)] text-[var(--rt-text)] sm:max-w-lg";

type Props = {
  onRestore: (session: DebateSession) => void;
  triggerClassName?: string;
};

export function SavedDebatesDrawer({ onRestore, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<DebateSession[]>([]);

  const refresh = () => setSessions(listDebateSessions());

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  const handleDelete = (id: string) => {
    deleteDebateSession(id);
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={triggerClassName}
          aria-label="Open saved debates"
        >
          <Archive className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Saved Debates
        </Button>
      </DialogTrigger>
      <DialogContent
        className={RT_DIALOG_CLASS}
        style={{ fontFamily: "var(--rt-font-body)" }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-[var(--rt-text)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Saved Debates
          </DialogTitle>
          <DialogDescription className="text-[var(--rt-muted)]">
            Sessions stored in your browser. Click to restore a debate workspace.
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {sessions.length === 0 && (
            <li className="py-8 text-center text-sm text-[var(--rt-muted)]">
              No saved sessions yet. Use Save Debate or Continue Later after a round table.
            </li>
          )}
          {sessions.map((session) => (
            <li
              key={session.id}
              className="rounded-lg border border-[var(--rt-border)] bg-[var(--rt-bg)]/60 p-3 transition-colors hover:border-[var(--rt-accent)]"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => {
                  onRestore(session);
                  setOpen(false);
                }}
              >
                <p
                  className="text-sm font-medium leading-snug text-[var(--rt-text)]"
                  style={{ fontFamily: "var(--rt-font-head)" }}
                >
                  {session.topic}
                </p>
                <p className="mt-1 text-xs text-[var(--rt-muted)]">
                  {sortDisplayNames(session.participants).slice(0, 3).join(", ")}
                  {session.participants.length > 3 ? "…" : ""} ·{" "}
                  {new Date(session.updatedAt).toLocaleDateString()}
                </p>
              </button>
              <div className="mt-2 flex items-center justify-between gap-2">
                {session.bookmarked && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--rt-muted)]">
                    <Bookmark className="h-3 w-3 text-[var(--rt-accent)]" aria-hidden />
                    Bookmarked
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 text-[var(--rt-muted)] hover:text-[var(--rt-accent)]"
                  onClick={() => handleDelete(session.id)}
                  aria-label={`Delete ${session.topic}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
