import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { parsePurchase, verifyWebhookSignature } from "@/lib/credits/lemonsqueezy";

export const runtime = "nodejs";

/**
 * Lemon Squeezy order webhook. Verifies the HMAC signature, then credits the
 * buyer's account via the service-role `apply_purchase` RPC (idempotent against
 * webhook retries). Non-purchase events are acknowledged and ignored.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const purchase = parsePurchase(payload);
  if (!purchase) {
    // Verified but not a credit purchase we handle — acknowledge so LS stops retrying.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    console.error("lemonsqueezy webhook: SUPABASE_SECRET_KEY not configured");
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const { data, error } = await admin.rpc("apply_purchase", {
    p_user: purchase.userId,
    p_credits: purchase.credits,
    p_event_id: purchase.eventId,
    p_meta: { source: "lemonsqueezy" },
  });
  if (error) {
    console.error("apply_purchase failed", error);
    return NextResponse.json({ error: "Could not apply purchase." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, applied: data === true });
}
