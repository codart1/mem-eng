import { NextResponse } from "next/server";
import { lookupWord } from "@/lib/dictionary/lookup";
import { generateWord, GenerateError } from "@/lib/ai/generate";
import { AI_PROVIDERS, type AiProvider } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Define a word for the "add from article" flow. Tries the free, no-key
 * dictionary first so it works for everyone; if the word isn't found there and
 * the caller supplied an AI key (or the server has one), falls back to AI for a
 * richer card. Responds with `{ word, source }`.
 */
export async function POST(req: Request) {
  let body: {
    word?: unknown;
    apiKey?: unknown;
    provider?: unknown;
    preferAi?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const word = typeof body.word === "string" ? body.word.trim() : "";
  if (!word || word.length > 80) {
    return NextResponse.json(
      { error: "Select a single word or short phrase." },
      { status: 400 },
    );
  }

  const provider: AiProvider = AI_PROVIDERS.includes(body.provider as AiProvider)
    ? (body.provider as AiProvider)
    : "claude";
  const byok = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const preferAi = body.preferAi === true;

  try {
    // Honor an explicit "richer card" request when a key is available.
    if (preferAi) {
      const ai = await tryAi(provider, byok, word);
      if (ai) return NextResponse.json({ word: ai, source: "ai" });
    }

    const fromDict = await lookupWord(word);
    if (fromDict) return NextResponse.json({ word: fromDict, source: "dictionary" });

    // Not in the dictionary — fall back to AI if we can.
    const ai = await tryAi(provider, byok, word);
    if (ai) return NextResponse.json({ word: ai, source: "ai" });

    return NextResponse.json(
      {
        error:
          "No definition found for that word. Try selecting a single dictionary word.",
      },
      { status: 404 },
    );
  } catch (err) {
    if (err instanceof GenerateError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("define error", err);
    return NextResponse.json(
      { error: "Something went wrong looking up that word." },
      { status: 500 },
    );
  }
}

/** Attempt AI generation, swallowing the "no key configured" case. */
async function tryAi(provider: AiProvider, byok: string, word: string) {
  try {
    return await generateWord(provider, byok, word);
  } catch (err) {
    // 501 = AI simply isn't configured; that's an expected no-op here.
    if (err instanceof GenerateError && err.status === 501) return null;
    throw err;
  }
}
