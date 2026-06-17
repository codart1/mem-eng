import { NextResponse } from "next/server";
import { lookupWord } from "@/lib/dictionary/lookup";
import { generateWord, GenerateError } from "@/lib/ai/generate";
import { authorizeAi, refundAiCredit } from "@/lib/ai/access";
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
  // The free dictionary only knows single headwords; idioms/phrases need AI.
  const isPhrase = /\s/.test(word);

  try {
    // Honor an explicit "richer card" request, and always use AI for phrases.
    if (preferAi || isPhrase) {
      const ai = await tryAi(provider, byok, word);
      if (ai) return NextResponse.json({ word: ai, source: "ai" });
    }

    if (!isPhrase) {
      const fromDict = await lookupWord(word);
      if (fromDict) return NextResponse.json({ word: fromDict, source: "dictionary" });

      // Not in the dictionary — fall back to AI if we can.
      const ai = await tryAi(provider, byok, word);
      if (ai) return NextResponse.json({ word: ai, source: "ai" });
    }

    return NextResponse.json(
      {
        error: isPhrase
          ? "Idioms and phrases need AI. Sign in and use credits, or add your API key in Settings."
          : "No definition found. Sign in and use credits, or add your API key for AI lookups.",
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

/**
 * Attempt AI generation. Returns null when AI simply isn't available to this
 * caller (no key configured, not signed in, or out of credits) so the dictionary
 * flow can show its tailored message. A credit is spent only on a real attempt,
 * and refunded if the provider then fails.
 */
async function tryAi(provider: AiProvider, byok: string, word: string) {
  let access;
  try {
    access = await authorizeAi(provider, byok);
  } catch (err) {
    if (err instanceof GenerateError && [401, 402, 501].includes(err.status)) {
      return null;
    }
    throw err;
  }
  try {
    return await generateWord(provider, access.apiKey, word);
  } catch (err) {
    if (access.charged) await refundAiCredit();
    throw err;
  }
}
