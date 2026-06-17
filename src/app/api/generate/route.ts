import { NextResponse } from "next/server";
import { generateWord, GenerateError } from "@/lib/ai/generate";
import { authorizeAi, refundAiCredit, type AiAccess } from "@/lib/ai/access";
import { AI_PROVIDERS, type AiProvider } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { word?: unknown; apiKey?: unknown; provider?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const word = typeof body.word === "string" ? body.word.trim() : "";
  if (!word || word.length > 80) {
    return NextResponse.json(
      { error: "Enter a single word or short phrase." },
      { status: 400 },
    );
  }

  const provider: AiProvider = AI_PROVIDERS.includes(body.provider as AiProvider)
    ? (body.provider as AiProvider)
    : "claude";

  // BYOK is used directly; otherwise a credit is spent on the server key. Never logged.
  const byok = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  let access: AiAccess | null = null;
  try {
    access = await authorizeAi(provider, byok);
    const word_ = await generateWord(provider, access.apiKey, word);
    return NextResponse.json({ word: word_ });
  } catch (err) {
    if (access?.charged) await refundAiCredit(); // provider failed after we charged
    if (err instanceof GenerateError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("generate error", err);
    return NextResponse.json(
      { error: "Something went wrong generating the card." },
      { status: 500 },
    );
  }
}
