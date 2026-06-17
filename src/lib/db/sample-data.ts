import { createEmptyCard } from "ts-fsrs";
import { db } from "./schema";
import { repository } from "./dexie-repository";
import type { NewCardInput } from "./repository";
import { SEED_BASELINE_TS, type Deck, type VocabCard } from "@/lib/types";

type SampleWord = Omit<NewCardInput, "deckId">;

/**
 * Stable, deterministic ids for the seeded starter content. Because every fresh
 * device generates the *same* ids (and the same {@link SEED_BASELINE_TS} clock),
 * the starter deck/cards dedupe on sync instead of multiplying — two devices
 * that both seed end up with one starter deck, not two.
 */
const SEED_DECK_ID = "seed-starter-everyday-english";
const seedCardId = (word: string) => `seed-card-${word}`;

export const SAMPLE_WORDS: SampleWord[] = [
  {
    word: "ubiquitous",
    phonetic: "/juːˈbɪkwɪtəs/",
    partOfSpeech: "adjective",
    definition: "Present, appearing, or found everywhere.",
    examples: [
      "Smartphones have become ubiquitous in modern life.",
      "Coffee shops are ubiquitous in this neighborhood.",
    ],
    synonyms: ["omnipresent", "pervasive", "universal"],
    antonyms: ["rare", "scarce"],
    cefr: "C1",
    mnemonic: "Think 'you-bik' — you bike everywhere, it's everywhere.",
    source: "manual",
  },
  {
    word: "resilient",
    phonetic: "/rɪˈzɪliənt/",
    partOfSpeech: "adjective",
    definition: "Able to recover quickly from difficulties; tough.",
    examples: ["Children are often remarkably resilient."],
    synonyms: ["tough", "hardy", "adaptable"],
    antonyms: ["fragile", "vulnerable"],
    cefr: "B2",
    source: "manual",
  },
  {
    word: "candid",
    phonetic: "/ˈkændɪd/",
    partOfSpeech: "adjective",
    definition: "Truthful and straightforward; frank.",
    examples: ["She gave a candid account of the events."],
    synonyms: ["frank", "honest", "forthright"],
    antonyms: ["evasive", "guarded"],
    cefr: "B2",
    source: "manual",
  },
  {
    word: "meticulous",
    phonetic: "/məˈtɪkjələs/",
    partOfSpeech: "adjective",
    definition: "Showing great attention to detail; very careful and precise.",
    examples: ["He kept meticulous records of every transaction."],
    synonyms: ["thorough", "scrupulous", "painstaking"],
    antonyms: ["careless", "sloppy"],
    cefr: "C1",
    source: "manual",
  },
  {
    word: "eloquent",
    phonetic: "/ˈeləkwənt/",
    partOfSpeech: "adjective",
    definition: "Fluent or persuasive in speaking or writing.",
    examples: ["She made an eloquent appeal for support."],
    synonyms: ["articulate", "expressive", "persuasive"],
    antonyms: ["inarticulate", "tongue-tied"],
    cefr: "C1",
    source: "manual",
  },
  {
    word: "pragmatic",
    phonetic: "/præɡˈmætɪk/",
    partOfSpeech: "adjective",
    definition: "Dealing with things sensibly and realistically.",
    examples: ["We need a pragmatic approach to the budget."],
    synonyms: ["practical", "realistic", "sensible"],
    antonyms: ["idealistic", "impractical"],
    cefr: "B2",
    source: "manual",
  },
  {
    word: "nuance",
    phonetic: "/ˈnjuːɑːns/",
    partOfSpeech: "noun",
    definition: "A subtle difference in meaning, expression, or sound.",
    examples: ["He appreciated the nuances of the argument."],
    synonyms: ["subtlety", "shade", "distinction"],
    antonyms: [],
    cefr: "C1",
    source: "manual",
  },
  {
    word: "tedious",
    phonetic: "/ˈtiːdiəs/",
    partOfSpeech: "adjective",
    definition: "Too long, slow, or dull; tiresome.",
    examples: ["Filling out the forms was a tedious task."],
    synonyms: ["boring", "monotonous", "dull"],
    antonyms: ["exciting", "engaging"],
    cefr: "B2",
    source: "manual",
  },
];

/**
 * Seed a starter deck on first run (idempotent). Browser-only.
 *
 * The deck and cards are written with deterministic ids and the fixed
 * {@link SEED_BASELINE_TS} clock (rather than the repository's random uid() +
 * now()), so that when two devices both seed and then sync the same account,
 * the starter content reconciles to a single copy instead of duplicating.
 */
export async function ensureSeeded(): Promise<void> {
  if (typeof window === "undefined") return;
  await repository.settings.get(); // ensure the settings row exists
  if (localStorage.getItem("lexio.seeded") === "1") return;
  const decks = await repository.decks.list();
  if (decks.length === 0) {
    const deck: Deck = {
      id: SEED_DECK_ID,
      name: "Starter — Everyday English",
      description: "A handful of useful words to try things out.",
      color: "teal",
      createdAt: SEED_BASELINE_TS,
      updatedAt: SEED_BASELINE_TS,
      deletedAt: null,
    };
    const cards: VocabCard[] = SAMPLE_WORDS.map((w) => ({
      id: seedCardId(w.word),
      deckId: SEED_DECK_ID,
      word: w.word,
      phonetic: w.phonetic,
      partOfSpeech: w.partOfSpeech,
      definition: w.definition,
      examples: w.examples ?? [],
      synonyms: w.synonyms ?? [],
      antonyms: w.antonyms ?? [],
      senses: w.senses,
      cefr: w.cefr,
      mnemonic: w.mnemonic,
      translation: w.translation,
      notes: w.notes,
      tags: w.tags ?? [],
      fsrs: createEmptyCard(new Date(SEED_BASELINE_TS)),
      source: w.source ?? "manual",
      createdAt: SEED_BASELINE_TS,
      updatedAt: SEED_BASELINE_TS,
      deletedAt: null,
    }));
    await db.transaction("rw", db.decks, db.cards, async () => {
      await db.decks.add(deck);
      await db.cards.bulkAdd(cards);
    });
  }
  localStorage.setItem("lexio.seeded", "1");
}
