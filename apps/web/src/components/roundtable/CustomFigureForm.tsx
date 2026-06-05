"use client";

import { useEffect, useState } from "react";
import {
  CUSTOM_FIGURE_LIMITS,
  type CustomFigure,
  type CustomFigureEnrichment,
  type CustomFigureInput,
} from "@/lib/custom-figures-storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

const EMPTY_FORM: CustomFigureInput = {
  fullName: "",
  activeYears: "",
  titleRole: "",
  shortDescription: "",
  biography: "",
  expertise: "",
  leadershipStyle: "",
  ideologyPhilosophy: "",
  debateStyle: "",
  keyAchievements: "",
  historicalContext: "",
  notableQuotes: "",
  profileImageUrl: "",
};

type Props = {
  open: boolean;
  editingFigure: CustomFigure | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CustomFigureInput, editingId: string | null) => void;
};

function sliceField(value: string, max: number): string {
  return value.slice(0, max);
}

function clampInput(input: CustomFigureInput): CustomFigureInput {
  const L = CUSTOM_FIGURE_LIMITS;
  return {
    fullName: input.fullName.trim().slice(0, L.fullName),
    activeYears: input.activeYears.trim().slice(0, L.activeYears),
    titleRole: input.titleRole.trim().slice(0, L.titleRole),
    shortDescription: input.shortDescription.trim().slice(0, L.shortDescription),
    biography: input.biography.trim().slice(0, L.biography),
    expertise: input.expertise.trim().slice(0, L.expertise),
    leadershipStyle: input.leadershipStyle.trim().slice(0, L.leadershipStyle),
    ideologyPhilosophy: input.ideologyPhilosophy.trim().slice(0, L.ideologyPhilosophy),
    debateStyle: input.debateStyle.trim().slice(0, L.debateStyle),
    keyAchievements: input.keyAchievements.trim().slice(0, L.keyAchievements),
    historicalContext: input.historicalContext.trim().slice(0, L.historicalContext),
    notableQuotes: input.notableQuotes.trim().slice(0, L.notableQuotes),
    profileImageUrl: input.profileImageUrl.trim().slice(0, L.profileImageUrl),
  };
}

function SectionHeading({ children }: { children: string }) {
  return (
    <p
      className="border-t border-[var(--rt-border)] pt-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--rt-accent)] first:border-0 first:pt-0"
      style={{ fontFamily: "var(--rt-font-head)" }}
    >
      {children}
    </p>
  );
}

export function CustomFigureForm({
  open,
  editingFigure,
  onOpenChange,
  onSave,
}: Props) {
  const [form, setForm] = useState<CustomFigureInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingFigure) {
      setForm({
        fullName: editingFigure.fullName,
        activeYears: editingFigure.activeYears,
        titleRole: editingFigure.titleRole,
        shortDescription: editingFigure.shortDescription,
        biography: editingFigure.biography,
        expertise: editingFigure.expertise,
        leadershipStyle: editingFigure.leadershipStyle,
        ideologyPhilosophy: editingFigure.ideologyPhilosophy,
        debateStyle: editingFigure.debateStyle,
        keyAchievements: editingFigure.keyAchievements,
        historicalContext: editingFigure.historicalContext,
        notableQuotes: editingFigure.notableQuotes,
        profileImageUrl: editingFigure.profileImageUrl,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [open, editingFigure]);

  const update = (field: keyof CustomFigureInput, value: string, max: number) => {
    setForm((prev) => ({ ...prev, [field]: sliceField(value, max) }));
  };

  const handleGenerate = async () => {
    const name = form.fullName.trim();
    if (!name) {
      setError("Enter a full name before generating a profile.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/roundtable/enrich-figure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          activeYears: form.activeYears.trim() || undefined,
          titleRole: form.titleRole.trim() || undefined,
          shortDescription: form.shortDescription.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        profile?: CustomFigureEnrichment;
      };
      if (!res.ok) {
        setError(data.error ?? "Profile generation failed.");
        return;
      }
      if (data.profile) {
        setForm((prev) => ({
          ...prev,
          ...data.profile,
          fullName: data.profile.fullName || prev.fullName,
          profileImageUrl: prev.profileImageUrl || data.profile.profileImageUrl,
        }));
      }
    } catch {
      setError("Could not reach the enrichment service.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    const fullName = form.fullName.trim();
    if (!fullName) {
      setError("Full name is required.");
      return;
    }
    setError(null);
    onSave(clampInput({ ...form, fullName }), editingFigure?.id ?? null);
    onOpenChange(false);
  };

  const canGenerate = form.fullName.trim().length > 0 && !generating;

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
          <DialogTitle
            className="text-base text-[var(--rt-text)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            {editingFigure ? "Edit custom figure" : "Add custom figure"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <SectionHeading>Identity</SectionHeading>
          <Field
            id="cf-fullName"
            label="Full name *"
            value={form.fullName}
            max={CUSTOM_FIGURE_LIMITS.fullName}
            onChange={(v) => update("fullName", v, CUSTOM_FIGURE_LIMITS.fullName)}
            placeholder="e.g. Barack Obama"
          />
          <Field
            id="cf-years"
            label="Active years"
            value={form.activeYears}
            max={CUSTOM_FIGURE_LIMITS.activeYears}
            onChange={(v) => update("activeYears", v, CUSTOM_FIGURE_LIMITS.activeYears)}
            placeholder="e.g. 1961–Present"
          />
          <Field
            id="cf-role"
            label="Title / role"
            value={form.titleRole}
            max={CUSTOM_FIGURE_LIMITS.titleRole}
            onChange={(v) => update("titleRole", v, CUSTOM_FIGURE_LIMITS.titleRole)}
            placeholder="e.g. 44th U.S. President & Statesman"
          />
          <Field
            id="cf-short"
            label="Short description"
            value={form.shortDescription}
            max={CUSTOM_FIGURE_LIMITS.shortDescription}
            onChange={(v) =>
              update("shortDescription", v, CUSTOM_FIGURE_LIMITS.shortDescription)
            }
            placeholder="One-line summary for cards"
          />

          <SectionHeading>Profile</SectionHeading>
          <TextField
            id="cf-bio"
            label="Biography"
            value={form.biography}
            max={CUSTOM_FIGURE_LIMITS.biography}
            onChange={(v) => update("biography", v, CUSTOM_FIGURE_LIMITS.biography)}
            rows={3}
          />
          <TextField
            id="cf-context"
            label="Historical context"
            value={form.historicalContext}
            max={CUSTOM_FIGURE_LIMITS.historicalContext}
            onChange={(v) =>
              update("historicalContext", v, CUSTOM_FIGURE_LIMITS.historicalContext)
            }
            rows={2}
          />
          <TextField
            id="cf-achievements"
            label="Key achievements"
            value={form.keyAchievements}
            max={CUSTOM_FIGURE_LIMITS.keyAchievements}
            onChange={(v) =>
              update("keyAchievements", v, CUSTOM_FIGURE_LIMITS.keyAchievements)
            }
            rows={2}
          />
          <TextField
            id="cf-quotes"
            label="Notable quotes"
            value={form.notableQuotes}
            max={CUSTOM_FIGURE_LIMITS.notableQuotes}
            onChange={(v) => update("notableQuotes", v, CUSTOM_FIGURE_LIMITS.notableQuotes)}
            rows={2}
            placeholder="Optional — representative quotations"
          />

          <SectionHeading>Debate persona</SectionHeading>
          <TextField
            id="cf-expertise"
            label="Areas of expertise"
            value={form.expertise}
            max={CUSTOM_FIGURE_LIMITS.expertise}
            onChange={(v) => update("expertise", v, CUSTOM_FIGURE_LIMITS.expertise)}
            rows={2}
            placeholder="Comma-separated, e.g. Diplomacy, Governance, Law"
          />
          <TextField
            id="cf-leadership"
            label="Leadership style"
            value={form.leadershipStyle}
            max={CUSTOM_FIGURE_LIMITS.leadershipStyle}
            onChange={(v) =>
              update("leadershipStyle", v, CUSTOM_FIGURE_LIMITS.leadershipStyle)
            }
            rows={2}
          />
          <TextField
            id="cf-ideology"
            label="Ideology & philosophy"
            value={form.ideologyPhilosophy}
            max={CUSTOM_FIGURE_LIMITS.ideologyPhilosophy}
            onChange={(v) =>
              update("ideologyPhilosophy", v, CUSTOM_FIGURE_LIMITS.ideologyPhilosophy)
            }
            rows={2}
          />
          <TextField
            id="cf-debate"
            label="Debate style"
            value={form.debateStyle}
            max={CUSTOM_FIGURE_LIMITS.debateStyle}
            onChange={(v) => update("debateStyle", v, CUSTOM_FIGURE_LIMITS.debateStyle)}
            rows={2}
            placeholder="How they argue in the round table"
          />

          <SectionHeading>Optional</SectionHeading>
          <Field
            id="cf-image"
            label="Profile image URL"
            value={form.profileImageUrl}
            max={CUSTOM_FIGURE_LIMITS.profileImageUrl}
            onChange={(v) =>
              update("profileImageUrl", v, CUSTOM_FIGURE_LIMITS.profileImageUrl)
            }
            placeholder="https://… or data:image/… (optional)"
          />

          {error && (
            <p className="text-xs text-[var(--rt-accent)]" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--rt-border)] pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={generating}
              onClick={() => onOpenChange(false)}
              className="border-[var(--rt-border)] text-[var(--rt-muted)]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGenerate}
              onClick={() => void handleGenerate()}
              className="border-[var(--rt-border)] text-[var(--rt-muted)] hover:text-[var(--rt-accent)]"
            >
              {generating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              )}
              {generating ? "Generating…" : "Generate profile"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="border border-[var(--rt-accent)] bg-transparent text-[var(--rt-accent)] hover:bg-[var(--rt-accent)] hover:text-[var(--rt-bg)]"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  value,
  max,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[11px] text-[var(--rt-muted)]">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 border-[var(--rt-border)] bg-[var(--rt-bg)] text-xs text-[var(--rt-text)] placeholder:text-[var(--rt-muted)]"
      />
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  max,
  onChange,
  rows,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[11px] text-[var(--rt-muted)]">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        maxLength={max}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="resize-none border-[var(--rt-border)] bg-[var(--rt-bg)] text-xs text-[var(--rt-text)] placeholder:text-[var(--rt-muted)]"
      />
    </div>
  );
}
