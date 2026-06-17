import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { GenerateError } from "@/lib/ai/generate";
import type { AiProvider } from "@/lib/types";

const CLAUDE_MODEL = "claude-haiku-4-5";
const OPENAI_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You help English learners read the news. Given a headline and summary, rewrite the summary in clear, simple English at roughly CEFR B1 level: 2-3 short sentences, plain vocabulary, no jargon. Keep it factual — do not add information that isn't in the input. Then pick up to 5 useful intermediate/advanced vocabulary words that appear in the original text and are worth learning (single words, lowercase, no duplicates).`;

export interface ArticleSummary {
  /** Learner-friendly rewrite of the article summary. */
  simplified: string;
  /** Up to 5 vocabulary words worth adding, drawn from the article. */
  vocabulary: string[];
}

const summarySchema = z.object({
  simplified: z.string().min(1),
  vocabulary: z.array(z.string()),
});

const SUMMARY_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    simplified: {
      type: "string",
      description: "The rewritten summary, 2-3 short B1-level sentences.",
    },
    vocabulary: {
      type: "array",
      items: { type: "string" },
      description: "Up to 5 useful vocabulary words from the original text.",
    },
  },
  required: ["simplified", "vocabulary"],
};

const norm = (s: ArticleSummary): ArticleSummary => ({
  simplified: s.simplified.trim(),
  vocabulary: Array.from(
    new Set(s.vocabulary.map((w) => w.trim().toLowerCase()).filter(Boolean)),
  ).slice(0, 5),
});

/**
 * Produce a learner-friendly summary + vocabulary for an article, using the
 * already-resolved `apiKey` (BYOK or the server key after a credit is spent).
 */
export async function summarizeArticle(
  provider: AiProvider,
  apiKey: string,
  title: string,
  summary: string,
): Promise<ArticleSummary> {
  const user = `Headline: ${title}\n\nSummary: ${summary}`;
  const raw =
    provider === "openai"
      ? await withOpenAI(apiKey, user)
      : await withClaude(apiKey, user);

  const parsed = summarySchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new GenerateError("Could not simplify this article. Try again.", 502);
  }
  return norm(parsed.data);
}

async function withClaude(apiKey: string, user: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: user }],
      output_config: {
        format: { type: "json_schema", schema: SUMMARY_JSON_SCHEMA },
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

async function withOpenAI(apiKey: string, user: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "article_summary",
          strict: true,
          schema: SUMMARY_JSON_SCHEMA,
        },
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
