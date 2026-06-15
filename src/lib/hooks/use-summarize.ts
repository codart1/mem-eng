"use client";

import { useMutation } from "@tanstack/react-query";
import { useSettings } from "./use-data";
import { useT } from "@/lib/i18n";

export interface SummarizeResult {
  simplified: string;
  vocabulary: string[];
}

export interface SummarizeVars {
  title: string;
  summary: string;
}

/** Simplify an article for learners via the user's AI key (optional feature). */
export function useSummarizeArticle() {
  const settings = useSettings();
  const t = useT();
  return useMutation<SummarizeResult, Error, SummarizeVars>({
    mutationFn: async ({ title, summary }) => {
      const apiKey =
        settings.aiProvider === "openai"
          ? settings.openaiApiKey
          : settings.byokApiKey;
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          provider: settings.aiProvider,
          apiKey: apiKey || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        simplified?: string;
        vocabulary?: string[];
        error?: string;
      };
      if (!res.ok || !data.simplified) {
        throw new Error(data.error ?? t.news.simplifyFailed);
      }
      return { simplified: data.simplified, vocabulary: data.vocabulary ?? [] };
    },
  });
}
