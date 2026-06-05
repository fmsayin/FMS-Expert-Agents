import type { HistoricalFigure } from "@/data/historical-figures";
import type { CustomFigure } from "@/lib/custom-figures-storage";

/** Case-insensitive ascending sort for user-visible names (A–Z). */
export function compareDisplayNames(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function sortHistoricalFiguresByName(
  figures: HistoricalFigure[],
): HistoricalFigure[] {
  return [...figures].sort((a, b) => compareDisplayNames(a.name, b.name));
}

export function sortCustomFiguresByName(figures: CustomFigure[]): CustomFigure[] {
  return [...figures].sort((a, b) =>
    compareDisplayNames(a.fullName, b.fullName),
  );
}

export function sortDisplayNames(names: string[]): string[] {
  return [...names].sort(compareDisplayNames);
}
