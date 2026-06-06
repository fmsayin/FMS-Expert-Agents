import type { CSSProperties } from "react";

/** Deterministic era-style gradient from figure id (no external images). */
export function hashFigureHue(figureId: string): number {
  let hash = 0;
  for (let i = 0; i < figureId.length; i++) {
    hash = figureId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/** Warm, period-toned portrait fill (bronze/umber bias). */
export function figurePortraitGradient(figureId: string): string {
  const hue = hashFigureHue(figureId);
  const warmHue = Math.round(hue * 0.32 + 26) % 360;
  const midHue = (warmHue + 22) % 360;
  const deepHue = (warmHue + 10) % 360;
  return `linear-gradient(155deg, hsl(${warmHue} 34% 40%) 0%, hsl(${midHue} 36% 26%) 52%, hsl(${deepHue} 30% 18%) 100%)`;
}

const PORTRAIT_SIZES = {
  sm: "h-9 w-9 text-[10px]",
  md: "h-11 w-11 text-[12px]",
  lg: "h-14 w-14 text-[14px]",
} as const;

export function figurePortraitClassName(size: "sm" | "md" | "lg" = "md"): string {
  return `${PORTRAIT_SIZES[size]} shrink-0 flex items-center justify-center rounded-full font-semibold tracking-wide text-white/90`;
}

/** Ornate medallion frame: bronze ring, vignette, subtle lift. */
export function figurePortraitStyle(active = false): CSSProperties {
  const ring = active
    ? "color-mix(in srgb, var(--rt-accent) 75%, #a67c00)"
    : "color-mix(in srgb, var(--rt-accent) 48%, var(--rt-border))";
  const outer = "color-mix(in srgb, var(--rt-border) 85%, var(--rt-bg))";
  return {
    boxShadow: [
      "inset 0 4px 12px rgba(0, 0, 0, 0.42)",
      "inset 0 -2px 4px rgba(255, 235, 210, 0.1)",
      `0 0 0 2px ${ring}`,
      `0 0 0 3.5px ${outer}`,
      active
        ? "0 2px 8px color-mix(in srgb, var(--rt-text) 20%, transparent)"
        : "0 1px 5px color-mix(in srgb, var(--rt-text) 14%, transparent)",
    ].join(", "),
  };
}

/** Vertical stack: name/era → role → tags. */
export function figureCardMetaStackClassName(): string {
  return "flex min-w-0 flex-1 flex-col";
}

/** Name + era grouping (gap-0.5). */
export function figureNameEraGroupClassName(): string {
  return "flex flex-col gap-0.5";
}

export function figureNameClassName(compact = false): string {
  return [
    "block truncate font-semibold leading-none tracking-tight text-[var(--rt-text)]",
    compact ? "text-[12px]" : "text-[15px]",
  ].join(" ");
}

export function figureEraClassName(compact = false): string {
  return [
    "block leading-snug text-[color-mix(in_srgb,var(--rt-muted)_92%,var(--rt-text))]",
    "uppercase tracking-[0.14em]",
    compact ? "text-[8px]" : "text-[9px]",
  ].join(" ");
}

export function figureEraStyle(): CSSProperties {
  return { fontVariant: "small-caps", letterSpacing: "0.12em" };
}

export function figureRoleClassName(compact = false): string {
  return [
    "block whitespace-normal break-words leading-snug text-[var(--rt-muted)]",
    "font-medium italic",
    compact ? "text-[10px]" : "text-[11px]",
  ].join(" ");
}

/** Wax-seal / engraved expertise labels. */
export function expertiseTagClassName(size: "xs" | "sm" = "sm"): string {
  const text = size === "xs" ? "text-[7px] px-1" : "text-[8px] px-1.5";
  return [
    "inline-block rounded-sm border py-px font-medium uppercase tracking-[0.14em]",
    text,
    "border-[color-mix(in_srgb,var(--rt-accent)_38%,var(--rt-border))]",
    "bg-[color-mix(in_srgb,var(--rt-surface)_72%,var(--rt-bg))]",
    "text-[color-mix(in_srgb,var(--rt-muted)_85%,var(--rt-text))]",
    "shadow-[inset_0_1px_0_color-mix(in_srgb,#fff_22%,transparent),0_1px_1px_color-mix(in_srgb,var(--rt-text)_6%,transparent)]",
  ].join(" ");
}

/** Observer sample block — editorial parchment panel. */
export function observerSampleSectionClassName(): string {
  return [
    "mb-4 rounded-lg border p-3",
    "border-[color-mix(in_srgb,var(--rt-accent)_28%,var(--rt-border))]",
    "bg-[color-mix(in_srgb,var(--rt-bg)_88%,var(--rt-surface))]",
    "shadow-[inset_0_1px_0_color-mix(in_srgb,#fff_24%,transparent),0_1px_4px_color-mix(in_srgb,var(--rt-text)_6%,transparent)]",
  ].join(" ");
}

/** Observer sample entry card — parchment tile. */
export function observerSampleCardClassName(): string {
  return [
    "rounded-md border p-2.5",
    "border-[color-mix(in_srgb,var(--rt-accent)_38%,var(--rt-border))]",
    "bg-[color-mix(in_srgb,var(--rt-surface)_92%,var(--rt-bg))]",
    "shadow-[0_1px_3px_color-mix(in_srgb,var(--rt-text)_8%,transparent),inset_0_0_14px_color-mix(in_srgb,var(--rt-accent)_5%,transparent),inset_0_1px_0_color-mix(in_srgb,#fff_30%,transparent)]",
  ].join(" ");
}

/** Figure selector card — parchment tile on the table. */
export function figureCardClassName(active: boolean): string {
  const base =
    "relative flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all duration-200 ease-out";
  if (active) {
    return [
      base,
      "border-[color-mix(in_srgb,var(--rt-accent)_52%,var(--rt-border))]",
      "bg-[color-mix(in_srgb,var(--rt-surface)_94%,var(--rt-bg))]",
      "shadow-[0_2px_10px_color-mix(in_srgb,var(--rt-text)_14%,transparent),inset_0_0_18px_color-mix(in_srgb,var(--rt-accent)_7%,transparent),inset_0_1px_0_color-mix(in_srgb,#fff_38%,transparent)]",
    ].join(" ");
  }
  return [
    base,
    "border-[var(--rt-border)]",
    "bg-[color-mix(in_srgb,var(--rt-bg)_90%,var(--rt-surface))]",
    "shadow-[inset_0_1px_0_color-mix(in_srgb,#fff_28%,transparent),0_1px_4px_color-mix(in_srgb,var(--rt-text)_7%,transparent)]",
    "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--rt-accent)_38%,var(--rt-border))]",
    "hover:bg-[color-mix(in_srgb,var(--rt-surface)_82%,var(--rt-bg))]",
    "hover:shadow-[0_4px_14px_color-mix(in_srgb,var(--rt-text)_11%,transparent),inset_0_1px_0_color-mix(in_srgb,#fff_32%,transparent)]",
  ].join(" ");
}

/** Active participant chip — seated at the table. */
export function activeParticipantCardClassName(compact: boolean): string {
  const size = compact
    ? "min-w-[120px] max-w-[160px] gap-2 rounded-md px-2 py-1"
    : "min-w-[140px] max-w-[min(100%,260px)] flex-1 gap-2.5 rounded-lg px-3 py-2.5";
  return [
    "group relative flex items-start text-left transition-all duration-200 ease-out",
    size,
    "border border-[color-mix(in_srgb,var(--rt-accent)_42%,var(--rt-border))]",
    "bg-[color-mix(in_srgb,var(--rt-surface)_90%,var(--rt-bg))]",
    "shadow-[0_1px_3px_color-mix(in_srgb,var(--rt-text)_9%,transparent),inset_0_1px_0_color-mix(in_srgb,#fff_35%,transparent),inset_0_-1px_3px_color-mix(in_srgb,var(--rt-text)_4%,transparent)]",
    "hover:-translate-y-0.5 hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--rt-text)_13%,transparent),inset_0_1px_0_color-mix(in_srgb,#fff_40%,transparent)]",
  ].join(" ");
}
