import type { CSSProperties } from "react";
import type { RoundTableThemeId } from "@/components/roundtable/types";

export type RoundTableTheme = {
  id: RoundTableThemeId;
  label: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  fontHead: string;
  fontBody: string;
};

export const ROUNDTABLE_THEMES: Record<RoundTableThemeId, RoundTableTheme> = {
  scholarly: {
    id: "scholarly",
    label: "Serious & Scholarly",
    bg: "#f5f0e8",
    surface: "#ede8dc",
    border: "#c8b89a",
    text: "#2c2416",
    muted: "#7a6a52",
    accent: "#8b4513",
    fontHead: "'Cormorant Garamond', Georgia, serif",
    fontBody: "'Source Serif 4', Georgia, serif",
  },
  dark: {
    id: "dark",
    label: "Modern & Sleek",
    bg: "#0d1117",
    surface: "#161b22",
    border: "#2a3441",
    text: "#e6edf3",
    muted: "#7d8590",
    accent: "#4493f8",
    fontHead: "'Rajdhani', system-ui, sans-serif",
    fontBody: "'IBM Plex Mono', ui-monospace, monospace",
  },
  editorial: {
    id: "editorial",
    label: "Historical & Editorial",
    bg: "#f4ead5",
    surface: "#ebe0c8",
    border: "#c4a574",
    text: "#1a1208",
    muted: "#6b5c3e",
    accent: "#8b6914",
    fontHead: "var(--font-playfair), 'Playfair Display', Georgia, serif",
    fontBody: "var(--font-serif), 'Source Serif 4', Georgia, serif",
  },
  futuristic: {
    id: "futuristic",
    label: "Bold & Futuristic",
    bg: "#020817",
    surface: "#0a1628",
    border: "#1e3a5f",
    text: "#e2f0ff",
    muted: "#5a8aa8",
    accent: "#00d4ff",
    fontHead: "'Rajdhani', system-ui, sans-serif",
    fontBody: "'IBM Plex Mono', ui-monospace, monospace",
  },
};

export function themeToCssVars(theme: RoundTableTheme): CSSProperties {
  return {
    ["--rt-bg" as string]: theme.bg,
    ["--rt-surface" as string]: theme.surface,
    ["--rt-border" as string]: theme.border,
    ["--rt-text" as string]: theme.text,
    ["--rt-muted" as string]: theme.muted,
    ["--rt-accent" as string]: theme.accent,
    ["--rt-font-head" as string]: theme.fontHead,
    ["--rt-font-body" as string]: theme.fontBody,
  };
}
