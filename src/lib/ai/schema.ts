import { z } from "zod";
import type { GeneratedWord } from "@/lib/types";
import type { NewCardInput } from "@/lib/db/repository";

export const senseSchema = z.object({
  partOfSpeech: z.string(),
  definition: z.string(),
  examples: z.array(z.string()),
});

export const generatedWordSchema = z.object({
  word: z.string().min(1),
  phonetic: z.string(),
  cefr: z.string(),
  senses: z.array(senseSchema).min(1),
  synonyms: z.array(z.string()),
  antonyms: z.array(z.string()),
  mnemonic: z.string(),
});

export type GeneratedWordRaw = z.infer<typeof generatedWordSchema>;

/** JSON Schema passed to Claude's structured-output `output_config.format`. */
export const WORD_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    word: { type: "string", description: "The headword, corrected spelling if needed." },
    phonetic: {
      type: "string",
      description: "IPA pronunciation, e.g. /ˈwɜːrd/. Empty string if unknown.",
    },
    cefr: {
      type: "string",
      description: "CEFR level (A1, A2, B1, B2, C1, C2). Empty string if unsure.",
    },
    senses: {
      type: "array",
      description: "1–3 of the most common senses, most frequent first.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          partOfSpeech: { type: "string" },
          definition: {
            type: "string",
            description: "A clear, learner-friendly definition.",
          },
          examples: {
            type: "array",
            items: { type: "string" },
            description: "1–2 natural example sentences.",
          },
        },
        required: ["partOfSpeech", "definition", "examples"],
      },
    },
    synonyms: { type: "array", items: { type: "string" } },
    antonyms: { type: "array", items: { type: "string" } },
    mnemonic: {
      type: "string",
      description: "A short memory hook. Empty string if none.",
    },
  },
  required: [
    "word",
    "phonetic",
    "cefr",
    "senses",
    "synonyms",
    "antonyms",
    "mnemonic",
  ],
};

const clean = (s: string) => (s.trim() ? s.trim() : undefined);

/** Normalize the raw model output into our domain shape. */
export function toGeneratedWord(raw: GeneratedWordRaw): GeneratedWord {
  return {
    word: raw.word.trim(),
    phonetic: clean(raw.phonetic),
    cefr: clean(raw.cefr),
    senses: raw.senses.map((s) => ({
      partOfSpeech: s.partOfSpeech.trim(),
      definition: s.definition.trim(),
      examples: s.examples.map((e) => e.trim()).filter(Boolean),
    })),
    synonyms: raw.synonyms.map((s) => s.trim()).filter(Boolean),
    antonyms: raw.antonyms.map((s) => s.trim()).filter(Boolean),
    mnemonic: clean(raw.mnemonic),
  };
}

/** Build a card insert payload from a generated word for a given deck. */
export function generatedWordToCardInput(
  word: GeneratedWord,
  deckId: string,
  overrides?: { word?: string; definition?: string },
): NewCardInput {
  const primary = word.senses[0];
  const examples = Array.from(
    new Set(word.senses.flatMap((s) => s.examples)),
  ).slice(0, 4);
  return {
    deckId,
    word: overrides?.word?.trim() || word.word,
    phonetic: word.phonetic,
    partOfSpeech: primary?.partOfSpeech,
    definition: overrides?.definition?.trim() || primary?.definition || "",
    examples,
    synonyms: word.synonyms,
    antonyms: word.antonyms,
    senses: word.senses,
    cefr: word.cefr,
    mnemonic: word.mnemonic,
    source: "ai",
  };
}
