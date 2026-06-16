"use client";

import { useCallback, useEffect, useState } from "react";

/** Reader appearance preferences, persisted locally (same pattern as locale). */
export interface ReaderPrefs {
  /** Body font multiplier (1 = base ~17px). */
  fontScale: number;
  lineSpacing: number;
  width: "narrow" | "normal" | "wide";
  theme: "default" | "sepia" | "dark";
}

export const READER_DEFAULTS: ReaderPrefs = {
  fontScale: 1,
  lineSpacing: 1.7,
  width: "normal",
  theme: "default",
};

const STORAGE_KEY = "lexio-reader-prefs";

/**
 * Reading preferences kept in localStorage. SSR and first paint use the
 * defaults (so hydration is consistent); the stored prefs are applied right
 * after mount. `mounted` lets the UI avoid a flash before prefs are read.
 */
export function useReaderPrefs() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(READER_DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...READER_DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed prefs */
    }
    setMounted(true);
  }, []);

  const update = useCallback((patch: Partial<ReaderPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage may be unavailable */
      }
      return next;
    });
  }, []);

  return { prefs, update, mounted };
}
