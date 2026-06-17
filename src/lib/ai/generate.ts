import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import {
  WORD_JSON_SCHEMA,
  generatedWordSchema,
  toGeneratedWord,
} from "@/lib/ai/schema";
import type { AiProvider, GeneratedWord } from "@/lib/types";

// Cheap, capable defaults. Both support native structured outputs, so the model
// returns valid JSON matching WORD_JSON_SCHEMA every time (still Zod-validated).
const CLAUDE_MODEL = "claude-haiku-4-5";
const OPENAI_MODEL = "gpt-4o-mini";

/** A thrown error that already carries the user-facing message + HTTP status. */
export class GenerateError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Generate a rich vocabulary card for `word` with the chosen provider, using the
 * already-resolved `apiKey` (BYOK or, after a credit is spent, the server key —
 * see {@link import("./access").authorizeAi}). Throws {@link GenerateError} with
 * a user-facing message.
 */
export async function generateWord(
  provider: AiProvider,
  apiKey: string,
  word: string,
): Promise<GeneratedWord> {
  const raw =
    provider === "openai"
      ? await generateWithOpenAI(apiKey, word)
      : await generateWithClaude(apiKey, word);

  const parsed = generatedWordSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new GenerateError("Could not parse the generated card. Try again.", 502);
  }
  return toGeneratedWord(parsed.data);
}

/** Returns the raw JSON text from Claude, or throws a GenerateError. */
async function generateWithClaude(apiKey: string, word: string): Promise<string> {
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
async function generateWithOpenAI(apiKey: string, word: string): Promise<string> {
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
