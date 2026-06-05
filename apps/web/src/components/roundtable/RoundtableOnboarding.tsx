"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "fms-roundtable-onboarding-dismissed";

const STEPS = [
  { num: 1, label: "Select participants" },
  { num: 2, label: "Enter a topic" },
  { num: 3, label: "Launch debate" },
  { num: 4, label: "Review the report" },
] as const;

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function dismissOnboarding(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function RoundtableOnboarding() {
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    setVisible(!isDismissed());
  }, []);

  if (visible !== true) return null;

  return (
    <section
      className="rt-controls-zone relative shrink-0 border-b px-3 py-1 md:px-4"
      style={{ borderColor: "var(--rt-border)" }}
      aria-label="How the round table works"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className="mb-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--rt-muted)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            How it works
          </p>
          <ol
            className={cn(
              "m-0 flex list-none flex-col gap-1 p-0",
              "sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1 sm:gap-y-0.5",
            )}
          >
            {STEPS.map((step, i) => (
              <li
                key={step.num}
                className="flex min-w-0 items-center gap-1 sm:shrink-0"
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[8px] font-semibold",
                    "border-[var(--rt-accent)]/40 text-[var(--rt-accent)]",
                  )}
                  style={{ fontFamily: "var(--rt-font-head)" }}
                  aria-hidden
                >
                  {step.num}
                </span>
                <span
                  className="text-[10px] text-[var(--rt-muted)]"
                  style={{ fontFamily: "var(--rt-font-body)" }}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className="mx-0.5 hidden shrink-0 text-[var(--rt-border)] select-none sm:inline"
                    aria-hidden
                  >
                    ·
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissOnboarding();
            setVisible(false);
          }}
          className="shrink-0 rounded-sm p-0.5 text-[var(--rt-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--rt-surface)_80%,var(--rt-bg))] hover:text-[var(--rt-text)]"
          aria-label="Dismiss onboarding guide"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </section>
  );
}
