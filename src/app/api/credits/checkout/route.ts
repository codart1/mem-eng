import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCheckout,
  isLemonSqueezyConfigured,
  variantIdForPack,
} from "@/lib/credits/lemonsqueezy";
import { getCreditPack } from "@/lib/credits/packs";

export const runtime = "nodejs";

/**
 * Start a Lemon Squeezy checkout for a credit pack. Requires a signed-in user;
 * embeds their id so the webhook can credit the right account. Returns the
 * hosted checkout URL for the client to redirect to.
 */
export async function POST(req: Request) {
  if (!isLemonSqueezyConfigured()) {
    return NextResponse.json(
      { error: "Buying credits isn't available right now." },
      { status: 501 },
    );
  }

  let body: { packId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const pack = typeof body.packId === "string" ? getCreditPack(body.packId) : undefined;
  if (!pack) {
    return NextResponse.json({ error: "Unknown credit pack." }, { status: 400 });
  }
  const variantId = variantIdForPack(pack.id);
  if (!variantId) {
    return NextResponse.json(
      { error: "This credit pack isn't configured yet." },
      { status: 501 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Accounts aren't available." }, { status: 501 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to buy credits." }, { status: 401 });
  }

  try {
    const url = await createCheckout({
      variantId,
      userId: user.id,
      email: user.email ?? undefined,
      redirectUrl: `${new URL(req.url).origin}/settings?purchase=success`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json(
      { error: "Couldn't start checkout. Please try again." },
      { status: 502 },
    );
  }
}
