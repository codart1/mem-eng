"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  STORAGE_KEY,
  isLocale,
  resolveLocale,
  type Locale,
} from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";

const DICTIONARIES: Record<Locale, Dictionary> = { en, vi };

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** The active dictionary, e.g. `t.landing.hero.title`. */
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Client-side i18n. We deliberately avoid `/[lang]` routing + middleware:
 * the app is an offline-first PWA, and middleware can't run without a network.
 * Locale is a user preference persisted in localStorage and applied on the
 * client. SSR and the first client render both use DEFAULT_LOCALE to keep
 * hydration consistent; the stored preference is applied right after mount
 * (the matching `<head>` script already sets <html lang> to avoid a flash for
 * the default-language majority).
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const resolved = resolveLocale(stored, navigator.languages ?? []);
    setLocaleState(resolved);
    document.documentElement.lang = resolved;
    document.documentElement.dataset.lexioLocale = resolved;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    document.documentElement.dataset.lexioLocale = next;
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: DICTIONARIES[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

/** Convenience accessor for components that only need the dictionary. */
export function useT(): Dictionary {
  return useI18n().t;
}
