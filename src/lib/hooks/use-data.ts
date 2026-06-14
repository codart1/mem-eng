"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/schema";
import { repository } from "@/lib/db/dexie-repository";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type Deck,
  type VocabCard,
  type ReviewLogEntry,
} from "@/lib/types";
import {
  buildStudyQueue,
  type StudyQueue,
  type DueCounts,
} from "@/lib/srs/queue";
import { startOfDay } from "@/lib/utils";

export function useDecks(): Deck[] | undefined {
  return useLiveQuery(() => repository.decks.list(), []);
}

export function useDeck(id?: string): Deck | undefined {
  return useLiveQuery(() => (id ? repository.decks.get(id) : undefined), [id]);
}

export function useCardsByDeck(id?: string): VocabCard[] | undefined {
  return useLiveQuery(
    () => (id ? repository.cards.listByDeck(id) : Promise.resolve([])),
    [id],
  );
}

export function useAllCards(): VocabCard[] | undefined {
  return useLiveQuery(() => repository.cards.listAll(), []);
}

export function useSettings(): AppSettings {
  const s = useLiveQuery(() => db.settings.get("app"), []);
  return s ?? { ...DEFAULT_SETTINGS, updatedAt: 0 };
}

export function useTodayLogs(): ReviewLogEntry[] | undefined {
  return useLiveQuery(
    () => repository.reviews.listSince(startOfDay().getTime()),
    [],
  );
}

export function useAllLogs(): ReviewLogEntry[] | undefined {
  return useLiveQuery(() => repository.reviews.listAll(), []);
}

export interface UseStudyQueue {
  queue?: StudyQueue;
  loading: boolean;
}

export function useStudyQueue(deckId?: string): UseStudyQueue {
  const cards = useLiveQuery(
    () =>
      deckId ? repository.cards.listByDeck(deckId) : repository.cards.listAll(),
    [deckId],
  );
  const logs = useTodayLogs();
  const settings = useSettings();
  const queue = useMemo(
    () => (cards && logs ? buildStudyQueue(cards, logs, settings) : undefined),
    [cards, logs, settings],
  );
  return { queue, loading: cards === undefined || logs === undefined };
}

export function useDueSummary(deckId?: string): DueCounts | undefined {
  return useStudyQueue(deckId).queue?.counts;
}

export interface DeckStat {
  deck: Deck;
  total: number;
  due: number;
  newCount: number;
}

export function useDeckStats(): DeckStat[] | undefined {
  const decks = useDecks();
  const cards = useAllCards();
  const logs = useTodayLogs();
  const settings = useSettings();
  return useMemo(() => {
    if (!decks || !cards || !logs) return undefined;
    return decks.map((deck) => {
      const deckCards = cards.filter((c) => c.deckId === deck.id);
      const deckLogs = logs.filter((l) => l.deckId === deck.id);
      const counts = buildStudyQueue(deckCards, deckLogs, settings).counts;
      return {
        deck,
        total: deckCards.length,
        due: counts.due,
        newCount: counts.new,
      };
    });
  }, [decks, cards, logs, settings]);
}
