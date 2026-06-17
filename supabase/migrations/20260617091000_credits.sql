-- Lexio AI credits — run with `pnpm db:push` (or paste into the SQL editor).
--
-- Credits let signed-in users pay for server-side AI when they haven't supplied
-- their own API key. Balance lives in `credits`; every change is recorded in
-- `credit_ledger`. New users get a starter grant; spends/refunds happen through
-- SECURITY DEFINER functions so the client can never edit its own balance
-- directly. Purchases are applied by the Lemon Squeezy webhook (service role).

-- ── Balance ────────────────────────────────────────────────────────────────
create table if not exists public.credits (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  balance    int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
alter table public.credits enable row level security;
-- Read-only for the owner; all writes go through the functions below.
drop policy if exists "credits_select_own" on public.credits;
create policy "credits_select_own" on public.credits
  for select using ((select auth.uid()) = user_id);

-- ── Ledger (audit trail) ─────────────────────────────────────────────────────
create table if not exists public.credit_ledger (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  delta      int  not null,                       -- +grant / -spend
  reason     text not null,                       -- signup_bonus|spend|refund|purchase
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.credit_ledger enable row level security;
drop policy if exists "ledger_select_own" on public.credit_ledger;
create policy "ledger_select_own" on public.credit_ledger
  for select using ((select auth.uid()) = user_id);
create index if not exists credit_ledger_user_idx
  on public.credit_ledger (user_id, created_at desc);

-- ── Webhook idempotency ──────────────────────────────────────────────────────
-- No RLS policies => only the service role (webhook) can touch it.
create table if not exists public.processed_webhooks (
  event_id   text primary key,
  created_at timestamptz not null default now()
);
alter table public.processed_webhooks enable row level security;

-- ── Starter grant on signup ──────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.credits (user_id, balance) values (new.id, 25)
    on conflict (user_id) do nothing;
  insert into public.credit_ledger (user_id, delta, reason)
    values (new.id, 25, 'signup_bonus');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill existing users once (idempotent), so accounts created before this
-- migration also get the starter credits.
insert into public.credits (user_id, balance)
  select id, 25 from auth.users
  on conflict (user_id) do nothing;

-- ── Spend / refund (called by the signed-in user via RPC) ─────────────────────
create or replace function public.consume_credit(p_amount int default 1)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ok  boolean := false;
begin
  if uid is null or p_amount <= 0 then return false; end if;
  update public.credits
     set balance = balance - p_amount, updated_at = now()
   where user_id = uid and balance >= p_amount;
  if found then
    insert into public.credit_ledger (user_id, delta, reason)
      values (uid, -p_amount, 'spend');
    ok := true;
  end if;
  return ok;
end;
$$;

create or replace function public.refund_credit(p_amount int default 1)
returns void
language plpgsql security definer set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null or p_amount <= 0 then return; end if;
  update public.credits
     set balance = balance + p_amount, updated_at = now()
   where user_id = uid;
  if found then
    insert into public.credit_ledger (user_id, delta, reason)
      values (uid, p_amount, 'refund');
  end if;
end;
$$;

revoke all on function public.consume_credit(int) from public, anon;
revoke all on function public.refund_credit(int) from public, anon;
grant execute on function public.consume_credit(int) to authenticated;
grant execute on function public.refund_credit(int) to authenticated;

-- ── Apply a purchase (called only by the webhook / service role) ──────────────
-- Idempotent: the first call for an event_id credits the account; retries no-op.
create or replace function public.apply_purchase(
  p_user uuid, p_credits int, p_event_id text, p_meta jsonb default '{}'::jsonb
)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.processed_webhooks (event_id) values (p_event_id);
  insert into public.credits (user_id, balance) values (p_user, p_credits)
    on conflict (user_id)
    do update set balance = public.credits.balance + p_credits, updated_at = now();
  insert into public.credit_ledger (user_id, delta, reason, meta)
    values (p_user, p_credits, 'purchase', p_meta);
  return true;
exception when unique_violation then
  return false;  -- event already processed
end;
$$;

revoke all on function public.apply_purchase(uuid, int, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.apply_purchase(uuid, int, text, jsonb) to service_role;
