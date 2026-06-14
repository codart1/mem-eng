import { repository } from "./dexie-repository";
import type { NewCardInput } from "./repository";

type SampleWord = Omit<NewCardInput, "deckId">;

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

/** Seed a starter deck on first run (idempotent). Browser-only. */
export async function ensureSeeded(): Promise<void> {
  if (typeof window === "undefined") return;
  await repository.settings.get(); // ensure the settings row exists
  if (localStorage.getItem("lexio.seeded") === "1") return;
  const decks = await repository.decks.list();
  if (decks.length === 0) {
    const deck = await repository.decks.create({
      name: "Starter — Everyday English",
      description: "A handful of useful words to try things out.",
      color: "teal",
    });
    await repository.cards.createMany(
      SAMPLE_WORDS.map((w) => ({ ...w, deckId: deck.id })),
    );
  }
  localStorage.setItem("lexio.seeded", "1");
}
