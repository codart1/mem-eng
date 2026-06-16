-- Lexio cloud sync — run this once in the Supabase SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- A single generic table holds every synced record as JSONB, keyed by
-- (user_id, collection, id). Sync is last-write-wins on `updated_at`
-- (epoch milliseconds, matching the client's `updatedAt`). Soft deletes are
-- tracked with `deleted_at` so a delete on one device propagates to others.
--
-- Row-Level Security guarantees a user can only ever read or write their own
-- rows. Books and other heavy blobs are intentionally NOT synced (they stay
-- local), consistent with how the app's export/import already excludes them.

create table if not exists public.sync_records (
  user_id     uuid   not null references auth.users (id) on delete cascade,
  -- One of: 'decks' | 'cards' | 'reviewLogs' | 'settings'
  collection  text   not null,
  -- The client-generated record id (for settings this is the literal 'app').
  id          text   not null,
  -- The full record, serialized. Date fields become ISO strings and are
  -- revived on the client after pull.
  data        jsonb  not null,
  -- Last-write-wins clock (epoch ms) — mirrors the record's updatedAt.
  updated_at  bigint not null,
  -- Soft-delete marker (epoch ms) or null when live.
  deleted_at  bigint,
  -- Server-side bookkeeping (not used for conflict resolution).
  synced_at   timestamptz not null default now(),
  primary key (user_id, collection, id)
);

-- Fast incremental pulls: "give me everything in this collection changed since X".
create index if not exists sync_records_pull_idx
  on public.sync_records (user_id, collection, updated_at);

alter table public.sync_records enable row level security;

-- Idempotent policy creation (re-runnable without errors).
drop policy if exists "sync_records_select_own" on public.sync_records;
drop policy if exists "sync_records_insert_own" on public.sync_records;
drop policy if exists "sync_records_update_own" on public.sync_records;
drop policy if exists "sync_records_delete_own" on public.sync_records;

create policy "sync_records_select_own" on public.sync_records
  for select using ((select auth.uid()) = user_id);

create policy "sync_records_insert_own" on public.sync_records
  for insert with check ((select auth.uid()) = user_id);

create policy "sync_records_update_own" on public.sync_records
  for update using ((select auth.uid()) = user_id)
            with check ((select auth.uid()) = user_id);

create policy "sync_records_delete_own" on public.sync_records
  for delete using ((select auth.uid()) = user_id);
