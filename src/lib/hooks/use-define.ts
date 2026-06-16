"use client";

import { useMutation } from "@tanstack/react-query";
import type { GeneratedWord } from "@/lib/types";
import { useSettings } from "./use-data";
import { useT } from "@/lib/i18n";

export interface DefineResult {
  word: GeneratedWord;
  /** Where the definition came from, for a subtle UI hint. */
  source: "dictionary" | "ai";
}

export interface DefineVars {
  word: string;
  /** Force the richer AI card even when the word is in the dictionary. */
  preferAi?: boolean;
}

/**
 * Look up a word for the "add from article" flow. Hits /api/define, which tries
 * the free dictionary first and falls back to the user's AI key when needed.
 */
export function useDefineWord() {
  const settings = useSettings();
  const t = useT();
  return useMutation<DefineResult, Error, DefineVars>({
    mutationFn: async ({ word, preferAi }) => {
      const apiKey =
        settings.aiProvider === "openai"
          ? settings.openaiApiKey
          : settings.byokApiKey;
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          word,
          preferAi,
          provider: settings.aiProvider,
          apiKey: apiKey || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        word?: GeneratedWord;
        source?: "dictionary" | "ai";
        error?: string;
      };
      if (!res.ok || !data.word) {
        throw new Error(data.error ?? t.vocab.lookupFailed);
      }
      return { word: data.word, source: data.source ?? "dictionary" };
    },
  });
}
