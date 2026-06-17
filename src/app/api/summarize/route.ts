import { NextResponse } from "next/server";
import { summarizeArticle } from "@/lib/ai/summarize";
import { GenerateError } from "@/lib/ai/generate";
import { authorizeAi, refundAiCredit, type AiAccess } from "@/lib/ai/access";
import { AI_PROVIDERS, type AiProvider } from "@/lib/types";

export const runtime = "nodejs";

/** Rewrite an article summary for learners (optional, uses the caller's AI key). */
export async function POST(req: Request) {
  let body: {
    title?: unknown;
    summary?: unknown;
    apiKey?: unknown;
    provider?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  if (!title && !summary) {
    return NextResponse.json({ error: "Nothing to summarize." }, { status: 400 });
  }

  const provider: AiProvider = AI_PROVIDERS.includes(body.provider as AiProvider)
    ? (body.provider as AiProvider)
    : "claude";
  const byok = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  let access: AiAccess | null = null;
  try {
    access = await authorizeAi(provider, byok);
    const result = await summarizeArticle(
      provider,
      access.apiKey,
      title,
      summary.slice(0, 2000),
    );
    return NextResponse.json(result);
  } catch (err) {
    if (access?.charged) await refundAiCredit();
    if (err instanceof GenerateError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("summarize error", err);
    return NextResponse.json(
      { error: "Something went wrong simplifying this article." },
      { status: 500 },
    );
  }
}
