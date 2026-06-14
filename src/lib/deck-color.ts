import type { DeckColor } from "@/lib/types";

/** Deck accent colors as oklch values (applied via inline style to avoid Tailwind purge issues). */
export const DECK_COLOR_VALUES: Record<DeckColor, string> = {
  teal: "oklch(0.62 0.13 196)",
  amber: "oklch(0.78 0.142 72)",
  rose: "oklch(0.64 0.2 18)",
  violet: "oklch(0.6 0.16 290)",
  emerald: "oklch(0.66 0.15 158)",
  sky: "oklch(0.66 0.13 232)",
  orange: "oklch(0.7 0.16 55)",
  slate: "oklch(0.6 0.03 240)",
};

export function deckColor(key: string | undefined): string {
  return DECK_COLOR_VALUES[(key ?? "teal") as DeckColor] ?? DECK_COLOR_VALUES.teal;
}
