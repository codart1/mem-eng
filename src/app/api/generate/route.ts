import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import {
  WORD_JSON_SCHEMA,
  generatedWordSchema,
  toGeneratedWord,
} from "@/lib/ai/schema";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5";

export async function POST(req: Request) {
  let body: { word?: unknown; apiKey?: unknown };
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

  // BYOK takes precedence; fall back to the server key. Never logged or stored.
  const byok = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const apiKey = byok || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI is not configured. Add your Anthropic API key in Settings, or set ANTHROPIC_API_KEY on the server.",
      },
      { status: 501 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: `Word: ${word}` }],
      output_config: {
        format: { type: "json_schema", schema: WORD_JSON_SCHEMA },
      },
    });

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return NextResponse.json(
        { error: "The model returned no usable content. Try again." },
        { status: 502 },
      );
    }

    const parsed = generatedWordSchema.safeParse(JSON.parse(text.text));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Could not parse the generated card. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ word: toGeneratedWord(parsed.data) });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      if (err.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Check your key in Settings." },
          { status: 401 },
        );
      }
      if (err.status === 429) {
        return NextResponse.json(
          { error: "Rate limited. Please wait a moment and try again." },
          { status: 429 },
        );
      }
      return NextResponse.json(
        { error: "The AI service returned an error. Try again shortly." },
        { status: 502 },
      );
    }
    console.error("generate error", err);
    return NextResponse.json(
      { error: "Something went wrong generating the card." },
      { status: 500 },
    );
  }
}
