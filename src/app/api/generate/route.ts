import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import {
  WORD_JSON_SCHEMA,
  generatedWordSchema,
  toGeneratedWord,
} from "@/lib/ai/schema";
import { AI_PROVIDERS, type AiProvider } from "@/lib/types";

export const runtime = "nodejs";

// Cheap, capable defaults. Both support native structured outputs, so the model
// returns valid JSON matching WORD_JSON_SCHEMA every time (still Zod-validated).
const CLAUDE_MODEL = "claude-haiku-4-5";
const OPENAI_MODEL = "gpt-4o-mini";

/** A thrown error that already carries the user-facing message + HTTP status. */
class GenerateError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

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

  // BYOK takes precedence; fall back to the matching server key. Never logged.
  const byok = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  try {
    const raw =
      provider === "openai"
        ? await generateWithOpenAI(byok, word)
        : await generateWithClaude(byok, word);

    const parsed = generatedWordSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Could not parse the generated card. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ word: toGeneratedWord(parsed.data) });
  } catch (err) {
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

/** Returns the raw JSON text from Claude, or throws a GenerateError. */
async function generateWithClaude(byok: string, word: string): Promise<string> {
  const apiKey = byok || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new GenerateError(
      "AI is not configured. Add your Anthropic API key in Settings, or set ANTHROPIC_API_KEY on the server.",
      501,
    );
  }

  const client = new Anthropic({ apiKey });
  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
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
      throw new GenerateError("The model returned no usable content. Try again.", 502);
    }
    return text.text;
  } catch (err) {
    if (err instanceof Anthropic.APIError) throw mapProviderStatus(err.status);
    throw err;
  }
}

/** Returns the raw JSON text from OpenAI, or throws a GenerateError. */
async function generateWithOpenAI(byok: string, word: string): Promise<string> {
  const apiKey = byok || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new GenerateError(
      "AI is not configured. Add your OpenAI API key in Settings, or set OPENAI_API_KEY on the server.",
      501,
    );
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Word: ${word}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "vocab_card", strict: true, schema: WORD_JSON_SCHEMA },
      },
    }),
  });

  if (!res.ok) throw mapProviderStatus(res.status);

  const data = (await res.json()) as {
    choices?: { message?: { content?: string; refusal?: string | null } }[];
  };
  const choice = data.choices?.[0]?.message;
  if (choice?.refusal) {
    throw new GenerateError("The model declined this request. Try another word.", 502);
  }
  if (!choice?.content) {
    throw new GenerateError("The model returned no usable content. Try again.", 502);
  }
  return choice.content;
}

/** Map a provider HTTP status onto a user-facing GenerateError. */
function mapProviderStatus(status: number | undefined): GenerateError {
  if (status === 401) {
    return new GenerateError("Invalid API key. Check your key in Settings.", 401);
  }
  if (status === 429) {
    return new GenerateError(
      "Rate limited. Please wait a moment and try again.",
      429,
    );
  }
  return new GenerateError("The AI service returned an error. Try again shortly.", 502);
}
