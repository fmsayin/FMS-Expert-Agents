"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoundTableThemeId } from "@/components/roundtable/types";
import { ROUNDTABLE_THEMES } from "@/components/roundtable/themes";

type Props = {
  themeId: RoundTableThemeId;
  onThemeChange: (id: RoundTableThemeId) => void;
};

export function ThemeSwitcher({ themeId, onThemeChange }: Props) {
  return (
    <Select value={themeId} onValueChange={(v) => onThemeChange(v as RoundTableThemeId)}>
      <SelectTrigger
        className="h-8 w-[200px] border-[var(--rt-border)] bg-[var(--rt-bg)] text-xs text-[var(--rt-text)]"
        aria-label="Visual theme"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-[var(--rt-border)] bg-[var(--rt-surface)] text-[var(--rt-text)]">
        {Object.values(ROUNDTABLE_THEMES).map((t) => (
          <SelectItem
            key={t.id}
            value={t.id}
            className="text-[var(--rt-text)] focus:bg-[color-mix(in_srgb,var(--rt-accent)_12%,var(--rt-surface))]"
          >
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
