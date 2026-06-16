import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { GenerateError } from "@/lib/ai/generate";
import type { AiProvider } from "@/lib/types";

// Same cheap/capable defaults as the rest of the app — the assistant reuses the
// user's configured provider + key (see /api/generate, /api/summarize).
const CLAUDE_MODEL = "claude-haiku-4-5";
const OPENAI_MODEL = "gpt-4o-mini";

/** Newest-first cap so the prompt stays small even in a long session. */
export const MAX_HISTORY = 12;

/** One turn of the (ephemeral) conversation sent up from the client. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** A vocabulary set the assistant proposes — words only; cards are generated on add. */
export interface SuggestedSet {
  title: string;
  description: string;
  /** Difficulty band, e.g. "B2–C1". */
  level: string;
  words: string[];
}

export interface ChatResult {
  reply: string;
  /** May be empty — only populated when proposing new vocabulary. */
  suggestedSets: SuggestedSet[];
}

const CHAT_SYSTEM_PROMPT = `You are Lexio's study coach: a warm, concise assistant inside an offline-first English-vocabulary flashcard app that uses FSRS spaced repetition.

You receive a JSON snapshot of the learner's current data (decks, due/new counts, study streak, retention rate, card-state breakdown, recent activity, CEFR distribution, and words they struggle with). Ground every answer in that snapshot — cite real numbers, deck names, and words. Never invent data that isn't there.

What you do:
- Answer questions about their progress and learning.
- When asked (or when it clearly helps), summarize their progress: be specific and encouraging, highlight the streak, what's due, retention, and one concrete next step.
- Suggest vocabulary sets when the user asks for new words, or when their workload is light and they'd benefit. Each set is WORDS ONLY (the app generates full cards later): 5–15 single words/short phrases, lowercase, no duplicates, realistic for the learner's apparent level (lean on the CEFR distribution). Do NOT suggest words already present in their decks. Give the set a short title, a one-line description, and a level band (e.g. "B2–C1").

Style: friendly, brief, plain English. Use short paragraphs or compact lists. Put your conversational answer in "reply". Put any proposed sets in "suggestedSets" (empty array when you're not proposing any). Do not describe the set words inside "reply" — the app renders the set as a card the user can add in one tap.`;

const suggestedSetSchema = z.object({
  title: z.string(),
  description: z.string(),
  level: z.string(),
  words: z.array(z.string()),
});

const chatResponseSchema = z.object({
  reply: z.string().min(1),
  suggestedSets: z.array(suggestedSetSchema),
});

const CHAT_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: {
      type: "string",
      description: "The conversational answer in clear, friendly English.",
    },
    suggestedSets: {
      type: "array",
      description:
        "Proposed vocabulary sets (words only). Empty array when not proposing any.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", description: "Short set title." },
          description: { type: "string", description: "One-line description." },
          level: { type: "string", description: "CEFR band, e.g. B2–C1." },
          words: {
            type: "array",
            items: { type: "string" },
            description: "5–15 lowercase words/short phrases, no duplicates.",
          },
        },
        required: ["title", "description", "level", "words"],
      },
    },
  },
  required: ["reply", "suggestedSets"],
};

const norm = (r: z.infer<typeof chatResponseSchema>): ChatResult => ({
  reply: r.reply.trim(),
  suggestedSets: r.suggestedSets
    .map((s) => ({
      title: s.title.trim(),
      description: s.description.trim(),
      level: s.level.trim(),
      words: Array.from(
        new Set(s.words.map((w) => w.trim().toLowerCase()).filter(Boolean)),
      ).slice(0, 15),
    }))
    .filter((s) => s.title && s.words.length > 0),
});

/** Answer a chat turn, grounded in the learner's data snapshot. */
export async function chatReply(
  provider: AiProvider,
  byok: string,
  snapshot: string,
  messages: ChatMessage[],
): Promise<ChatResult> {
  const history = messages.slice(-MAX_HISTORY);
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    throw new GenerateError("The last message must be from the user.", 400);
  }

  const raw =
    provider === "openai"
      ? await withOpenAI(byok, snapshot, history)
      : await withClaude(byok, snapshot, history);

  const parsed = chatResponseSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new GenerateError("Could not read the assistant's reply. Try again.", 502);
  }
  return norm(parsed.data);
}

async function withClaude(
  byok: string,
  snapshot: string,
  history: ChatMessage[],
): Promise<string> {
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
      max_tokens: 1500,
      system: [
        // Static instructions are cacheable; the per-request snapshot is not.
        { type: "text", text: CHAT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: `Learner data snapshot (JSON):\n${snapshot}` },
      ],
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      output_config: {
        format: { type: "json_schema", schema: CHAT_JSON_SCHEMA },
      },
    });
    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      throw new GenerateError("The model returned no usable content. Try again.", 502);
    }
    return text.text;
  } catch (err) {
    if (err instanceof Anthropic.APIError) throw mapStatus(err.status);
    throw err;
  }
}

async function withOpenAI(
  byok: string,
  snapshot: string,
  history: ChatMessage[],
): Promise<string> {
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
      max_tokens: 1500,
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        { role: "system", content: `Learner data snapshot (JSON):\n${snapshot}` },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "chat_response", strict: true, schema: CHAT_JSON_SCHEMA },
      },
    }),
  });
  if (!res.ok) throw mapStatus(res.status);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string; refusal?: string | null } }[];
  };
  const choice = data.choices?.[0]?.message;
  if (choice?.refusal) {
    throw new GenerateError("The model declined this request.", 502);
  }
  if (!choice?.content) {
    throw new GenerateError("The model returned no usable content. Try again.", 502);
  }
  return choice.content;
}

function mapStatus(status: number | undefined): GenerateError {
  if (status === 401) {
    return new GenerateError("Invalid API key. Check your key in Settings.", 401);
  }
  if (status === 429) {
    return new GenerateError("Rate limited. Please wait a moment and try again.", 429);
  }
  return new GenerateError("The AI service returned an error. Try again shortly.", 502);
}
