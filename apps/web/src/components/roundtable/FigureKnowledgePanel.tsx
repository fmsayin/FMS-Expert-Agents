"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HistoricalFigure } from "@/data/historical-figures";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FigureSource } from "@/lib/figure-rag/types";
import { cn } from "@/lib/utils";
import { FileUp, Loader2, Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  figure: HistoricalFigure | null;
};

type KnowledgeResponse = {
  sources: FigureSource[];
  chunkCount: number;
  error?: string;
  code?: string;
};

export function FigureKnowledgePanel({ open, onOpenChange, figure }: Props) {
  const [sources, setSources] = useState<FigureSource[]>([]);
  const [chunkCount, setChunkCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("Research notes");
  const [notesText, setNotesText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadKnowledge = useCallback(async () => {
    if (!figure) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/roundtable/figures/${encodeURIComponent(figure.id)}/knowledge`);
      const data = (await res.json()) as KnowledgeResponse;
      if (!res.ok) {
        setError(data.error ?? "Failed to load knowledge");
        return;
      }
      setSources(data.sources ?? []);
      setChunkCount(data.chunkCount ?? 0);
    } catch {
      setError("Failed to load knowledge");
    } finally {
      setLoading(false);
    }
  }, [figure]);

  useEffect(() => {
    if (open && figure) {
      void loadKnowledge();
      setNotesText("");
      setSourceName("Research notes");
    }
  }, [open, figure, loadKnowledge]);

  const handleAddText = async () => {
    if (!figure || !notesText.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/roundtable/figures/${encodeURIComponent(figure.id)}/knowledge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: notesText,
            sourceName: sourceName.trim() || "Research notes",
            sourceType: "notes",
          }),
        },
      );
      const data = (await res.json()) as { error?: string; code?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to add knowledge");
        return;
      }
      setNotesText("");
      await loadKnowledge();
    } catch {
      setError("Failed to add knowledge");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!figure) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sourceName", file.name);
      const res = await fetch(
        `/api/roundtable/figures/${encodeURIComponent(figure.id)}/knowledge/upload`,
        { method: "POST", body: form },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      await loadKnowledge();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!figure) return;
    if (!window.confirm("Remove this source and all its indexed chunks?")) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/roundtable/figures/${encodeURIComponent(figure.id)}/knowledge/${encodeURIComponent(sourceId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Delete failed");
        return;
      }
      await loadKnowledge();
    } catch {
      setError("Delete failed");
    }
  };

  if (!figure) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto border-[var(--rt-border)] bg-[var(--rt-surface)] text-[var(--rt-text)] sm:max-w-lg",
        )}
        style={{ fontFamily: "var(--rt-font-body)" }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-[var(--rt-text)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Knowledge — {figure.name}
          </DialogTitle>
          <DialogDescription className="text-[var(--rt-muted)]">
            Add texts or PDFs for retrieval during debate. Without uploads, the figure uses
            their built-in profile only.
          </DialogDescription>
        </DialogHeader>

        <p
          className="text-[11px] text-[var(--rt-muted)]"
          style={{ fontFamily: "var(--rt-font-body)" }}
        >
          {loading ? "Loading…" : `${chunkCount} indexed chunk${chunkCount === 1 ? "" : "s"} · ${sources.length} source${sources.length === 1 ? "" : "s"}`}
        </p>

        {error && (
          <p className="text-[12px] text-red-600" role="alert">
            {error}
          </p>
        )}

        <section className="space-y-2">
          <h4
            className="text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Sources
          </h4>
          {sources.length === 0 && !loading && (
            <p className="text-[12px] text-[var(--rt-muted)]">No sources yet.</p>
          )}
          <ul className="space-y-1.5">
            {sources.map((src) => (
              <li
                key={src.id}
                className="flex items-center justify-between gap-2 rounded-md border border-[var(--rt-border)] px-2 py-1.5 text-[12px]"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium text-[var(--rt-text)]">{src.name}</span>
                  <span className="ml-1.5 text-[var(--rt-muted)]">({src.type})</span>
                </span>
                <button
                  type="button"
                  onClick={() => void handleDelete(src.id)}
                  className="shrink-0 rounded p-1 text-[var(--rt-muted)] hover:text-red-600"
                  aria-label={`Delete source ${src.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2 border-t border-[var(--rt-border)] pt-3">
          <h4
            className="text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Add text
          </h4>
          <div className="space-y-1.5">
            <Label htmlFor="knowledge-source-name" className="text-[11px] text-[var(--rt-muted)]">
              Source name
            </Label>
            <Input
              id="knowledge-source-name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="border-[var(--rt-border)] bg-[var(--rt-bg)] text-[var(--rt-text)]"
            />
          </div>
          <Textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={5}
            placeholder="Paste excerpts, lecture notes, or primary sources…"
            className="resize-y border-[var(--rt-border)] bg-[var(--rt-bg)] text-[var(--rt-text)] placeholder:text-[var(--rt-muted)]"
          />
          <Button
            type="button"
            size="sm"
            disabled={saving || !notesText.trim()}
            onClick={() => void handleAddText()}
            className="bg-[var(--rt-accent)] text-white hover:opacity-90"
          >
            {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
            Index text
          </Button>
        </section>

        <section className="space-y-2 border-t border-[var(--rt-border)] pt-3">
          <h4
            className="text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-muted)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Upload file
          </h4>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,text/plain,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUpload(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="border-[var(--rt-border)] text-[var(--rt-text)]"
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
            )}
            PDF or text file
          </Button>
          <p className="text-[10px] text-[var(--rt-muted)]">
            URL / link imports are planned for a later release.
          </p>
        </section>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--rt-border)]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
