"use client";

import { useMutation } from "@tanstack/react-query";
import type { GeneratedWord } from "@/lib/types";
import { useSettings } from "./use-data";

export function useGenerateWord() {
  const settings = useSettings();
  return useMutation<GeneratedWord, Error, string>({
    mutationFn: async (word: string) => {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          word,
          apiKey: settings.byokApiKey || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        word?: GeneratedWord;
        error?: string;
      };
      if (!res.ok || !data.word) {
        throw new Error(data.error ?? "Generation failed. Please try again.");
      }
      return data.word;
    },
  });
}
