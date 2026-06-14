# Lexio

**Learn English vocabulary that sticks.** Lexio is an offline-first flashcard
app that schedules reviews with the proven **FSRS** spaced-repetition algorithm
and lets you build cards instantly by typing a word and letting **AI** fill in
the rest.

- 🧠 **Smart scheduling** — [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) with Again/Hard/Good/Easy ratings and live next-interval previews.
- ✨ **AI flashcards** — type a word, get IPA, senses, examples, synonyms, CEFR level, and a mnemonic; edit and save.
- 📴 **Offline-first** — all data lives in your browser (IndexedDB). Installable PWA. No account required.
- 🎨 **Aurora design language** — a custom shadcn/ui theme (teal + amber, warm-paper / deep-slate), light & dark.
- 📊 **Stats** — streaks, retention, review history, and a due forecast.
- 🔒 **Your data** — export/import JSON backups; bring your own AI key.

## Tech stack

Next.js 16 (App Router, React 19) · TypeScript (strict) · Tailwind CSS v4 ·
shadcn/ui · ts-fsrs · Dexie (IndexedDB) · TanStack Query · Recharts ·
Anthropic SDK · Vitest + Testing Library · Playwright.

## Getting started

```bash
pnpm install
cp .env.local.example .env.local   # optional — only needed for AI generation
pnpm dev
```

Open http://localhost:3000. A starter deck is seeded on first run, so you can
study immediately.

### Enabling AI generation

AI is optional — the whole app works without it. To enable "Create → With AI":

- **Server key:** set `ANTHROPIC_API_KEY` in `.env.local`, **or**
- **BYOK:** paste your own Anthropic key in **Settings → AI generation** (stored
  only on your device).

Cost is a fraction of a cent per word — see [`docs/ai-cost.md`](docs/ai-cost.md)
for the provider rationale and how to swap models/providers.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Unit/component tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright) |
| `pnpm format` | Prettier |

## Architecture

```
src/
  app/                  # routes: dashboard, decks, study, create, stats, settings
    api/generate/       # AI route handler (Anthropic, structured outputs, BYOK)
  components/
    layout/  decks/  cards/  study/  create/  ui/   # feature + shadcn components
  lib/
    db/        # Dexie schema + repository pattern (sync-ready) + sample data
    srs/       # FSRS scheduler wrapper + pure study-queue builder
    ai/        # prompt + Zod schema for generated words
    hooks/     # live-query data hooks
    stats.ts   # pure analytics (streak, retention, forecast)
```

### Offline & sync-ready

All reads go through reactive Dexie live queries; all writes go through a
**repository interface** (`src/lib/db/repository.ts`). Every record carries
`updatedAt` / `deletedAt`, so a future remote backend can reconcile with
last-write-wins — without touching the UI. Login/sync is intentionally not built
yet, but the seams are in place.

### Spaced repetition

`src/lib/srs/scheduler.ts` wraps ts-fsrs (configurable retention, max interval,
fuzz). `src/lib/srs/queue.ts` is a pure function that builds the daily queue from
due cards + a new-card limit. Both are unit-tested.

## Testing

- **Unit/component** (`pnpm test`): scheduler transitions, queue limits,
  repository CRUD + import/export (via `fake-indexeddb`), stats, and the AI route.
- **E2E** (`pnpm test:e2e`): the study loop and AI-create flow (with the route
  mocked, so no key is needed). Run `pnpm exec playwright install chromium` once.

## License

MIT.
