import type { GeneratedWord, Sense } from "@/lib/types";

/**
 * Free, no-key dictionary lookup via dictionaryapi.dev. Returns a
 * {@link GeneratedWord} so it slots into the same card-add flow as AI results,
 * or `null` when the word isn't found (the caller may then fall back to AI).
 */

const ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const TIMEOUT_MS = 6000;

// Shape of the slice of the dictionaryapi.dev response we consume.
interface DictDefinition {
  definition?: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}
interface DictMeaning {
  partOfSpeech?: string;
  definitions?: DictDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}
interface DictEntry {
  word?: string;
  phonetic?: string;
  phonetics?: { text?: string }[];
  meanings?: DictMeaning[];
}

const clean = (s: string | undefined) => (s?.trim() ? s.trim() : undefined);
const dedupe = (xs: string[]) =>
  Array.from(new Set(xs.map((s) => s.trim()).filter(Boolean)));

export async function lookupWord(word: string): Promise<GeneratedWord | null> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT + encodeURIComponent(word.toLowerCase()), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Definitions are stable; cache for a day.
      next: { revalidate: 86400 },
    });
  } catch {
    return null;
  }

  if (res.status === 404) return null;
  if (!res.ok) return null;

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length === 0) return null;

  const entries = data as DictEntry[];
  const headword = clean(entries[0]?.word) ?? word.trim();

  const phonetic =
    clean(entries[0]?.phonetic) ??
    clean(entries.flatMap((e) => e.phonetics ?? []).find((p) => p.text?.trim())?.text);

  const senses: Sense[] = [];
  const synonyms: string[] = [];
  const antonyms: string[] = [];

  for (const entry of entries) {
    for (const meaning of entry.meanings ?? []) {
      synonyms.push(...(meaning.synonyms ?? []));
      antonyms.push(...(meaning.antonyms ?? []));

      const examples: string[] = [];
      let definition = "";
      for (const d of meaning.definitions ?? []) {
        synonyms.push(...(d.synonyms ?? []));
        antonyms.push(...(d.antonyms ?? []));
        if (!definition && d.definition?.trim()) definition = d.definition.trim();
        if (d.example?.trim()) examples.push(d.example.trim());
      }
      if (definition) {
        senses.push({
          partOfSpeech: clean(meaning.partOfSpeech) ?? "",
          definition,
          examples: examples.slice(0, 2),
        });
      }
    }
  }

  if (senses.length === 0) return null;

  return {
    word: headword,
    phonetic,
    cefr: undefined,
    senses: senses.slice(0, 3),
    synonyms: dedupe(synonyms).slice(0, 8),
    antonyms: dedupe(antonyms).slice(0, 8),
    mnemonic: undefined,
  };
}
