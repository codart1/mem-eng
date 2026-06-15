"use client";

import { useMutation } from "@tanstack/react-query";
import type { GeneratedWord } from "@/lib/types";
import { useSettings } from "./use-data";
import { useT } from "@/lib/i18n";

export function useGenerateWord() {
  const settings = useSettings();
  const t = useT();
  return useMutation<GeneratedWord, Error, string>({
    mutationFn: async (word: string) => {
      const apiKey =
        settings.aiProvider === "openai"
          ? settings.openaiApiKey
          : settings.byokApiKey;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          word,
          provider: settings.aiProvider,
          apiKey: apiKey || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        word?: GeneratedWord;
        error?: string;
      };
      if (!res.ok || !data.word) {
        throw new Error(data.error ?? t.generate.failed);
      }
      return data.word;
    },
  });
}
