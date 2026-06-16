import { NextResponse } from "next/server";
import { chatReply, MAX_HISTORY, type ChatMessage } from "@/lib/ai/chat";
import { GenerateError } from "@/lib/ai/generate";
import { AI_PROVIDERS, type AiProvider } from "@/lib/types";

export const runtime = "nodejs";

/** Per-message content cap, so a runaway payload can't blow up the prompt. */
const MAX_CONTENT = 4000;
const MAX_SNAPSHOT = 12_000;

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  const out: ChatMessage[] = [];
  for (const m of value) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      const trimmed = content.trim();
      if (trimmed) out.push({ role, content: trimmed.slice(0, MAX_CONTENT) });
    }
  }
  return out.slice(-MAX_HISTORY);
}

/** Conversational study coach grounded in the caller's data snapshot. */
export async function POST(req: Request) {
  let body: {
    messages?: unknown;
    snapshot?: unknown;
    apiKey?: unknown;
    provider?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = parseMessages(body.messages);
  if (messages.length === 0) {
    return NextResponse.json({ error: "Nothing to send." }, { status: 400 });
  }

  const snapshot =
    typeof body.snapshot === "string" ? body.snapshot.slice(0, MAX_SNAPSHOT) : "{}";

  const provider: AiProvider = AI_PROVIDERS.includes(body.provider as AiProvider)
    ? (body.provider as AiProvider)
    : "claude";
  const byok = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  try {
    const result = await chatReply(provider, byok, snapshot, messages);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof GenerateError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("chat error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
