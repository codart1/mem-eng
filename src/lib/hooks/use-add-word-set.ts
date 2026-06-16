"use client";

import { useCallback, useState } from "react";
import { repository } from "@/lib/db/dexie-repository";
import { generatedWordToCardInput } from "@/lib/ai/schema";
import type { SuggestedSet } from "@/lib/ai/chat";
import {
  DECK_COLORS,
  type DeckColor,
  type GeneratedWord,
} from "@/lib/types";
import { useT } from "@/lib/i18n";
import { useSettings } from "./use-data";

/** How many words to generate at once — small, to be gentle on rate limits. */
const CONCURRENCY = 3;

export type AddStatus = "idle" | "adding" | "done" | "error";

export interface AddProgress {
  done: number;
  total: number;
}

export interface UseAddWordSet {
  status: AddStatus;
  progress: AddProgress;
  /** Number of cards actually created (after tolerated failures). */
  added: number;
  error: string | null;
  add: (set: SuggestedSet) => Promise<void>;
}

/** Deterministic accent so the same set always lands the same color. */
function colorFor(title: string): DeckColor {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) | 0;
  return DECK_COLORS[Math.abs(h) % DECK_COLORS.length];
}

/**
 * Turn a suggested word set into a real deck: generate a full card for each
 * word via /api/generate (same call shape as {@link useGenerateWord}), then
 * persist with the repository (mirrors the Discover add-as-deck flow). Failed
 * words are skipped; the caller sees how many were added.
 */
export function useAddWordSet(): UseAddWordSet {
  const t = useT();
  const settings = useSettings();
  const [status, setStatus] = useState<AddStatus>("idle");
  const [progress, setProgress] = useState<AddProgress>({ done: 0, total: 0 });
  const [added, setAdded] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (set: SuggestedSet) => {
      if (status === "adding") return;
      setStatus("adding");
      setError(null);
      setAdded(0);
      setProgress({ done: 0, total: set.words.length });

      const apiKey =
        settings.aiProvider === "openai"
          ? settings.openaiApiKey
          : settings.byokApiKey;

      async function generate(word: string): Promise<GeneratedWord | null> {
        try {
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
          };
          return res.ok && data.word ? data.word : null;
        } catch {
          return null;
        } finally {
          setProgress((p) => ({ ...p, done: p.done + 1 }));
        }
      }

      try {
        // Generate in small batches to bound concurrency.
        const results: (GeneratedWord | null)[] = [];
        for (let i = 0; i < set.words.length; i += CONCURRENCY) {
          const batch = set.words.slice(i, i + CONCURRENCY);
          results.push(...(await Promise.all(batch.map(generate))));
        }
        const generated = results.filter((w): w is GeneratedWord => w !== null);
        if (generated.length === 0) {
          setError(t.assistant.addAllFailed);
          setStatus("error");
          return;
        }

        const deck = await repository.decks.create({
          name: set.title,
          description: set.description || undefined,
          color: colorFor(set.title),
        });
        await repository.cards.createMany(
          generated.map((w) => generatedWordToCardInput(w, deck.id)),
        );

        setAdded(generated.length);
        setStatus("done");
      } catch {
        setError(t.assistant.addFailed);
        setStatus("error");
      }
    },
    [status, settings, t],
  );

  return { status, progress, added, error, add };
}
