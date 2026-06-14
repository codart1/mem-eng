// Lexio interface localization — config shared by the provider and the
// pre-hydration <head> script. Kept dependency-free so it can be inlined.

export const LOCALES = ["en", "vi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const STORAGE_KEY = "lexio-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

/** Short label shown on the compact toggle. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  vi: "VI",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Resolve the best initial locale from a stored preference or the browser's
 * languages. Used both in the inline head script (offline-safe, no imports)
 * and the provider's initial state.
 */
export function resolveLocale(
  stored: string | null | undefined,
  navigatorLanguages: readonly string[] = [],
): Locale {
  if (isLocale(stored)) return stored;
  for (const lang of navigatorLanguages) {
    const base = lang.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
