import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GenerateError } from "./generate";
import type { AiProvider } from "@/lib/types";

/**
 * The outcome of authorizing an AI request: the key to call the provider with,
 * and whether a credit was spent (so the caller can refund it if the provider
 * call then fails).
 */
export interface AiAccess {
  apiKey: string;
  charged: boolean;
}

const serverKeyFor = (provider: AiProvider) =>
  provider === "openai"
    ? process.env.OPENAI_API_KEY
    : process.env.ANTHROPIC_API_KEY;

/**
 * Decide how an AI call is paid for:
 * - A bring-your-own key → use it, no credit spent (the user pays their provider).
 * - Otherwise → require a signed-in user with credits, spend one, and use the
 *   server key. Throws a {@link GenerateError} (with a user-facing message and
 *   HTTP status) when the call isn't allowed.
 *
 * On a thrown error nothing has been charged. On success, refund via
 * {@link refundAiCredit} if the subsequent provider call fails.
 */
export async function authorizeAi(
  provider: AiProvider,
  byok: string,
): Promise<AiAccess> {
  if (byok) return { apiKey: byok, charged: false };

  const serverKey = serverKeyFor(provider) ?? "";
  if (!serverKey) {
    throw new GenerateError(
      "Server AI isn't available. Add your own API key in Settings.",
      501,
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new GenerateError(
      "Add your own API key in Settings to use AI.",
      501,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new GenerateError(
      "Sign in and use credits, or add your own API key in Settings.",
      401,
    );
  }

  const { data, error } = await supabase.rpc("consume_credit", { p_amount: 1 });
  if (error) {
    throw new GenerateError("Couldn't check your credits. Please try again.", 500);
  }
  if (data !== true) {
    throw new GenerateError(
      "You're out of credits. Buy more in Settings, or add your own API key.",
      402,
    );
  }

  return { apiKey: serverKey, charged: true };
}

/** Give a spent credit back (best-effort) when the provider call failed. */
export async function refundAiCredit(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase?.rpc("refund_credit", { p_amount: 1 });
  } catch (err) {
    console.error("credit refund failed", err);
  }
}
