"use client";

import type { TurkishViewMode } from "@/components/roundtable/types";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";

const STORAGE_KEY = "fms-roundtable-turkish-mode";

export function loadTurkishViewMode(): TurkishViewMode {
  if (typeof window === "undefined") return "bilingual";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (
      stored === "english_only" ||
      stored === "turkish_only" ||
      stored === "bilingual"
    ) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "bilingual";
}

export function saveTurkishViewMode(mode: TurkishViewMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

const MODES: { id: TurkishViewMode; label: string; short: string }[] = [
  { id: "english_only", label: "English Only", short: "EN" },
  { id: "bilingual", label: "Bilingual View", short: "EN+TR" },
  { id: "turkish_only", label: "Turkish Only", short: "TR" },
];

type Props = {
  mode: TurkishViewMode;
  onModeChange: (mode: TurkishViewMode) => void;
  className?: string;
};

export function TurkishModeToggle({ mode, onModeChange, className }: Props) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label="Turkish analysis display mode"
    >
      <Languages className="h-3.5 w-3.5 text-[var(--rt-muted)]" aria-hidden />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--rt-muted)]">
        View
      </span>
      <div
        className="inline-flex rounded-md border p-0.5"
        style={{ borderColor: "var(--rt-border)" }}
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              onModeChange(m.id);
              saveTurkishViewMode(m.id);
            }}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold transition-colors",
              mode === m.id
                ? "bg-[var(--rt-accent)] text-[var(--rt-bg)]"
                : "text-[var(--rt-muted)] hover:text-[var(--rt-text)]",
            )}
            aria-pressed={mode === m.id}
            aria-label={m.label}
            title={m.label}
          >
            {m.short}
          </button>
        ))}
      </div>
    </div>
  );
}
