# AI cost & provider choice

The "Create with AI" feature turns a single English word into a full flashcard
(IPA, senses, examples, synonyms/antonyms, CEFR, mnemonic). This note explains
how we keep that cheap and how to change it.

## The shape of the request

Each lookup is tiny:

- **Input:** a short system prompt (~250 tokens) + the word (~5 tokens).
- **Output:** one structured JSON card (~300–500 tokens).

So cost is dominated by a few hundred output tokens per card — fractions of a
cent regardless of provider.

## Why Claude Haiku 4.5

We default to **`claude-haiku-4-5`** via the official Anthropic SDK because:

1. **Native structured outputs.** We pass a JSON Schema with
   `output_config.format`, so the model returns valid, parseable JSON every
   time — no brittle "please return JSON" prompting or regex repair. The result
   is still validated with Zod (`src/lib/ai/schema.ts`) before it reaches the UI.
2. **Prompt caching.** The static system prompt is marked
   `cache_control: ephemeral`, so at scale repeated lookups read it from cache
   at ~10% of input price. (Note: the system prompt here is below the per-model
   minimum cacheable prefix, so caching mostly matters once prompts grow.)
3. **One SDK, one bill.** No second vendor to manage.

### Rough cost

At Haiku 4.5 pricing ($1 / $5 per 1M input/output tokens), a ~500-token-output
lookup costs on the order of **$0.0005** — about **2,000 cards per dollar**.
Negligible at indie scale.

## Comparison (June 2026 list prices, per 1M tokens)

| Model | Input | Output | Notes |
| --- | --- | --- | --- |
| Claude Haiku 4.5 | $1.00 | $5.00 | Structured outputs + caching, single SDK |
| GPT-4o-mini | $0.15 | $0.60 | Cheaper sticker price |
| Gemini 2.5 Flash-Lite | ~$0.10–0.25 | ~$0.40–1.50 | Cheapest, 1M context |

Because per-lookup cost is already a fraction of a cent, model choice here is
about **quality and integration**, not pennies. The provider is isolated to a
single file — see below — so switching is a localized change.

## How to change the provider or model

Everything lives in **`src/app/api/generate/route.ts`**. To swap models, change
the `MODEL` constant. To swap providers entirely, replace the Anthropic call
with another client and keep returning the same shape validated by
`generatedWordSchema`. Nothing else in the app needs to change.

## Who pays (key custody)

- **Server key** — set `ANTHROPIC_API_KEY` (see `.env.local.example`). All users
  share it.
- **BYOK (bring your own key)** — a user can paste their own Anthropic key in
  **Settings**. It's stored only in their browser (IndexedDB) and sent with the
  generate request; it's never persisted server-side or logged. BYOK takes
  precedence over the server key.

## Bulk imports

For large one-off imports, the Anthropic **Message Batches API** runs at 50% of
standard price (results within ~1 hour). Not wired up yet, but the per-card
prompt is identical, so it's a drop-in for a future "import a word list" flow.
