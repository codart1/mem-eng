#!/usr/bin/env node
/**
 * Lemon Squeezy helper — runs locally with YOUR keys; nothing leaves your machine.
 *
 * Usage (Node 20.6+, reads .env.local automatically):
 *   node --env-file=.env.local scripts/lemonsqueezy-setup.mjs
 *   node --env-file=.env.local scripts/lemonsqueezy-setup.mjs --create-webhook=https://your-domain/api/webhooks/lemonsqueezy
 *
 * What it does:
 *   - Lists your stores (copy the numeric id into LEMONSQUEEZY_STORE_ID).
 *   - Lists every product + variant with its id and price, so you can paste the
 *     right variant ids into LEMONSQUEEZY_VARIANT_SMALL/MEDIUM/LARGE.
 *   - With --create-webhook=<url>, creates an `order_created` webhook with a
 *     fresh signing secret and prints it (put it in LEMONSQUEEZY_WEBHOOK_SECRET).
 *
 * Note: Lemon Squeezy's API can't create products/variants — make those 3 packs
 * in the dashboard first, then run this to grab their ids.
 */
import crypto from "node:crypto";

const API = "https://api.lemonsqueezy.com/v1";
const KEY = process.env.LEMONSQUEEZY_API_KEY;
const STORE = process.env.LEMONSQUEEZY_STORE_ID || "";

if (!KEY) {
  console.error(
    "Missing LEMONSQUEEZY_API_KEY. Add it to .env.local and run with:\n" +
      "  node --env-file=.env.local scripts/lemonsqueezy-setup.mjs",
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${KEY}`,
  Accept: "application/vnd.api+json",
  "Content-Type": "application/vnd.api+json",
};

async function get(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`GET ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

async function listStores() {
  const { data } = await get("/stores");
  console.log("\n=== Stores ===");
  for (const s of data) {
    console.log(`  id=${s.id}  ${s.attributes.name}  (${s.attributes.domain})`);
  }
  if (!STORE && data.length) {
    console.log(`\n→ Set LEMONSQUEEZY_STORE_ID=${data[0].id}`);
  }
}

async function listVariants() {
  // Pull products (for names) then variants (for ids + prices).
  const products = await get(
    STORE ? `/products?filter[store_id]=${STORE}` : "/products",
  );
  const nameById = new Map(products.data.map((p) => [p.id, p.attributes.name]));

  const variants = await get("/variants");
  console.log("\n=== Variants (use these ids) ===");
  for (const v of variants.data) {
    const productId = v.relationships?.product?.data?.id;
    const product = nameById.get(productId) ?? `product ${productId ?? "?"}`;
    const price = v.attributes.price != null ? `$${(v.attributes.price / 100).toFixed(2)}` : "—";
    console.log(`  variant id=${v.id}  ${price}  "${v.attributes.name}"  [${product}]`);
  }
  console.log(
    "\n→ Paste the ids into LEMONSQUEEZY_VARIANT_SMALL / _MEDIUM / _LARGE\n" +
      "  (small=100 credits, medium=500, large=1500 — match src/lib/credits/packs.ts).",
  );
}

async function createWebhook(url) {
  if (!STORE) throw new Error("Set LEMONSQUEEZY_STORE_ID before creating a webhook.");
  const secret = crypto.randomBytes(20).toString("hex"); // 40 chars
  const res = await fetch(`${API}/webhooks`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        type: "webhooks",
        attributes: { url, events: ["order_created"], secret },
        relationships: {
          store: { data: { type: "stores", id: String(STORE) } },
        },
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Create webhook → ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
  const json = await res.json();
  console.log("\n=== Webhook created ===");
  console.log(`  id=${json.data.id}  url=${url}  events=order_created`);
  console.log(`\n→ Set LEMONSQUEEZY_WEBHOOK_SECRET=${secret}`);
}

const webhookArg = process.argv.find((a) => a.startsWith("--create-webhook="));

try {
  await listStores();
  await listVariants();
  if (webhookArg) await createWebhook(webhookArg.split("=").slice(1).join("="));
  console.log("\nDone. Update .env.local with the values above, then restart the dev server.\n");
} catch (err) {
  console.error("\nError:", err.message);
  process.exit(1);
}
