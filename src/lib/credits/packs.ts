/**
 * Credit packs offered for purchase. This list is client-safe (no secrets): the
 * UI renders it, and the checkout route maps a pack `id` to its Lemon Squeezy
 * variant id server-side (see `lib/credits/lemonsqueezy.ts`).
 *
 * `credits` is the source of truth for how many credits a pack grants — set your
 * Lemon Squeezy variant *price* to match each pack. `priceHint` is display only.
 */
export type CreditPackId = "small" | "medium" | "large";

export interface CreditPack {
  id: CreditPackId;
  label: string;
  credits: number;
  /** Display-only price hint; the real charge is whatever the LS variant is set to. */
  priceHint: string;
  /** Optional "best value" emphasis in the UI. */
  featured?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "small", label: "Starter", credits: 100, priceHint: "$2" },
  { id: "medium", label: "Value", credits: 500, priceHint: "$8", featured: true },
  { id: "large", label: "Power", credits: 1500, priceHint: "$20" },
];

export function getCreditPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}
