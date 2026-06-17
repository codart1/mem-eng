import crypto from "node:crypto";
import { CREDIT_PACKS, type CreditPackId } from "./packs";

/**
 * Server-only Lemon Squeezy integration: create hosted checkouts and verify +
 * parse the order webhook. No secrets leak to the client — pack→variant mapping
 * and the API/webhook keys all live in server env vars.
 */
const API = "https://api.lemonsqueezy.com/v1";

const apiKey = () => process.env.LEMONSQUEEZY_API_KEY ?? "";
const storeId = () => process.env.LEMONSQUEEZY_STORE_ID ?? "";
const webhookSecret = () => process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";

const VARIANT_ENV: Record<CreditPackId, string> = {
  small: "LEMONSQUEEZY_VARIANT_SMALL",
  medium: "LEMONSQUEEZY_VARIANT_MEDIUM",
  large: "LEMONSQUEEZY_VARIANT_LARGE",
};

/** True when checkouts can be created (API key + store configured). */
export const isLemonSqueezyConfigured = () =>
  apiKey() !== "" && storeId() !== "";

export function variantIdForPack(id: CreditPackId): string {
  return process.env[VARIANT_ENV[id]] ?? "";
}

/** Reverse lookup: how many credits a purchased variant grants (null if unknown). */
export function creditsForVariant(variantId: string): number | null {
  for (const pack of CREDIT_PACKS) {
    if (variantIdForPack(pack.id) === variantId) return pack.credits;
  }
  return null;
}

interface CheckoutOptions {
  variantId: string;
  userId: string;
  email?: string;
  redirectUrl: string;
}

/** Create a hosted checkout and return its URL. Embeds the user id as custom data. */
export async function createCheckout(opts: CheckoutOptions): Promise<string> {
  const res = await fetch(`${API}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: opts.email,
            // Echoed back on the webhook as meta.custom_data — how we know who paid.
            custom: { user_id: opts.userId },
          },
          product_options: { redirect_url: opts.redirectUrl },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId()) } },
          variant: { data: { type: "variants", id: String(opts.variantId) } },
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Lemon Squeezy checkout failed (${res.status}): ${text.slice(0, 300)}`,
    );
  }
  const json = (await res.json()) as { data?: { attributes?: { url?: string } } };
  const url = json.data?.attributes?.url;
  if (!url) throw new Error("Lemon Squeezy returned no checkout URL.");
  return url;
}

/** Constant-time verification of the X-Signature webhook header. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = webhookSecret();
  if (!secret || !signature) return false;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  const a = Buffer.from(digest, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface LsWebhookPayload {
  meta?: { event_name?: string; custom_data?: { user_id?: string } };
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      first_order_item?: { variant_id?: number | string };
    };
  };
}

export interface PurchaseEvent {
  /** Unique key for idempotency. */
  eventId: string;
  userId: string;
  credits: number;
}

/**
 * Extract a credit purchase from a verified webhook body, or null if it isn't a
 * paid order we recognize (other events are acknowledged and ignored).
 */
export function parsePurchase(raw: unknown): PurchaseEvent | null {
  const payload = (raw ?? {}) as LsWebhookPayload;
  if (payload.meta?.event_name !== "order_created") return null;
  if (payload.data?.attributes?.status !== "paid") return null;

  const userId = payload.meta?.custom_data?.user_id;
  const orderId = payload.data?.id;
  const variantId = String(payload.data?.attributes?.first_order_item?.variant_id ?? "");
  const credits = creditsForVariant(variantId);

  if (!userId || !orderId || credits == null) return null;
  return { eventId: `order_created:${orderId}`, userId, credits };
}
