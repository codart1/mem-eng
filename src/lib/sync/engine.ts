import type { SupabaseClient } from "@supabase/supabase-js";
import { db } from "@/lib/db/schema";
import type { Deck, VocabCard, ReviewLogEntry, AppSettings } from "@/lib/types";
import { loadSyncState, saveSyncState, type SyncState } from "./state";

const TABLE = "sync_records";

/** A locally-stored record, opaque to the engine apart from its accessors. */
type SyncRow = Record<string, unknown>;

/** The shape we read back from the remote table. */
interface RemoteRecord {
  id: string;
  data: SyncRow;
  updated_at: number;
  deleted_at: number | null;
}

export interface SyncResult {
  pulled: number;
  pushed: number;
}

// ---- Pure last-write-wins decisions (unit-tested) ---------------------------

/**
 * Remote rows worth applying locally: those we don't have, or that are strictly
 * newer than our copy. Equal timestamps are treated as identical and skipped.
 */
export function selectRemoteToApply<R extends { id: string; updated_at: number }>(
  remote: R[],
  localById: Map<string, { updatedAt: number }>,
): R[] {
  return remote.filter((r) => {
    const local = localById.get(r.id);
    return !local || r.updated_at > local.updatedAt;
  });
}

/** Local rows changed since the last push (their clock beats the high-water mark). */
export function selectLocalToPush<L extends { updatedAt: number }>(
  local: L[],
  pushedThrough: number,
): L[] {
  return local.filter((row) => row.updatedAt > pushedThrough);
}

// ---- Collections ------------------------------------------------------------

interface Collection {
  name: string;
  /** All local rows, including soft-deleted tombstones. */
  load: () => Promise<SyncRow[]>;
  id: (row: SyncRow) => string;
  /** Last-write-wins clock for this row (epoch ms). */
  clock: (row: SyncRow) => number;
  /** Soft-delete marker, or null for append-only/singleton collections. */
  deletedAt: (row: SyncRow) => number | null;
  /** Rehydrate Date fields lost to JSON before writing pulled rows to Dexie. */
  revive: (data: SyncRow) => SyncRow;
  write: (rows: SyncRow[]) => Promise<void>;
}

function reviveCard(c: VocabCard): VocabCard {
  return {
    ...c,
    fsrs: {
      ...c.fsrs,
      due: new Date(c.fsrs.due),
      last_review: c.fsrs.last_review ? new Date(c.fsrs.last_review) : undefined,
    },
  };
}

function reviveLog(l: ReviewLogEntry): ReviewLogEntry {
  return { ...l, due: new Date(l.due), review: new Date(l.review) };
}

const asRows = <T>(p: Promise<T[]>) => p as unknown as Promise<SyncRow[]>;
const num = (v: unknown) => (typeof v === "number" ? v : 0);
const numOrNull = (v: unknown) => (typeof v === "number" ? v : null);

const COLLECTIONS: Collection[] = [
  {
    name: "decks",
    load: () => asRows(db.decks.toArray()),
    id: (r) => r.id as string,
    clock: (r) => num(r.updatedAt),
    deletedAt: (r) => numOrNull(r.deletedAt),
    revive: (d) => d,
    write: (rows) => db.decks.bulkPut(rows as unknown as Deck[]).then(() => undefined),
  },
  {
    name: "cards",
    load: () => asRows(db.cards.toArray()),
    id: (r) => r.id as string,
    clock: (r) => num(r.updatedAt),
    deletedAt: (r) => numOrNull(r.deletedAt),
    revive: (d) => reviveCard(d as unknown as VocabCard) as unknown as SyncRow,
    write: (rows) =>
      db.cards.bulkPut(rows as unknown as VocabCard[]).then(() => undefined),
  },
  {
    name: "reviewLogs",
    // Append-only: the review timestamp is the clock and there are no deletes.
    load: () => asRows(db.reviewLogs.toArray()),
    id: (r) => r.id as string,
    clock: (r) => num(r.reviewedAt),
    deletedAt: () => null,
    revive: (d) => reviveLog(d as unknown as ReviewLogEntry) as unknown as SyncRow,
    write: (rows) =>
      db.reviewLogs.bulkPut(rows as unknown as ReviewLogEntry[]).then(() => undefined),
  },
  {
    name: "settings",
    // The singleton settings row ('app'). No deletes.
    load: () => asRows(db.settings.toArray()),
    id: () => "app",
    clock: (r) => num(r.updatedAt),
    deletedAt: () => null,
    revive: (d) => d,
    write: (rows) =>
      db.settings.bulkPut(rows as unknown as AppSettings[]).then(() => undefined),
  },
];

// ---- Reconcile --------------------------------------------------------------

async function syncCollection(
  supabase: SupabaseClient,
  userId: string,
  col: Collection,
  state: SyncState,
): Promise<{ pulled: number; pushed: number; maxPulled: number; maxPushed: number }> {
  const localRows = await col.load();
  // Normalize each row to its id + clock so the pure decision helpers don't need
  // to know where the timestamp lives (updatedAt vs reviewedAt).
  const normalized = localRows.map((row) => ({
    row,
    id: col.id(row),
    updatedAt: col.clock(row),
    deletedAt: col.deletedAt(row),
  }));
  const localById = new Map(
    normalized.map((n) => [n.id, { updatedAt: n.updatedAt }]),
  );

  // PUSH first, so rows we pull in this same run aren't immediately re-pushed.
  const toPush = selectLocalToPush(normalized, state.pushedThrough);
  let maxPushed = state.pushedThrough;
  if (toPush.length > 0) {
    const payload = toPush.map((n) => {
      maxPushed = Math.max(maxPushed, n.updatedAt);
      return {
        user_id: userId,
        collection: col.name,
        id: n.id,
        data: n.row,
        updated_at: n.updatedAt,
        deleted_at: n.deletedAt,
      };
    });
    const { error } = await supabase
      .from(TABLE)
      .upsert(payload, { onConflict: "user_id,collection,id" });
    if (error) throw new Error(`Push (${col.name}) failed: ${error.message}`);
  }

  // PULL everything changed since we last pulled.
  const { data, error } = await supabase
    .from(TABLE)
    .select("id,data,updated_at,deleted_at")
    .eq("collection", col.name)
    .gt("updated_at", state.pulledThrough)
    .order("updated_at", { ascending: true });
  if (error) throw new Error(`Pull (${col.name}) failed: ${error.message}`);

  const remote = (data ?? []) as RemoteRecord[];
  let maxPulled = state.pulledThrough;
  for (const r of remote) maxPulled = Math.max(maxPulled, r.updated_at);

  const winners = selectRemoteToApply(remote, localById);
  if (winners.length > 0) {
    // The pushed `data` already contains the row's own clock/delete fields, so
    // we just revive Date fields and write it back verbatim.
    const revived = winners.map((r) => col.revive(r.data));
    await col.write(revived);
  }

  return { pulled: winners.length, pushed: toPush.length, maxPulled, maxPushed };
}

/**
 * Run one full sync pass for `userId`. Reconciles every collection with
 * last-write-wins and advances the stored high-water marks. Anything applied
 * from the server is also counted as "pushed through" (it already lives on the
 * server) so it isn't redundantly re-uploaded next time.
 */
export async function syncNow(
  supabase: SupabaseClient,
  userId: string,
): Promise<SyncResult> {
  const state = loadSyncState(userId);
  let pulled = 0;
  let pushed = 0;
  let pulledThrough = state.pulledThrough;
  let pushedThrough = state.pushedThrough;

  for (const col of COLLECTIONS) {
    const r = await syncCollection(supabase, userId, col, state);
    pulled += r.pulled;
    pushed += r.pushed;
    pulledThrough = Math.max(pulledThrough, r.maxPulled);
    pushedThrough = Math.max(pushedThrough, r.maxPushed);
  }

  // Applied remote rows already exist on the server at their updated_at, so fold
  // pulledThrough into pushedThrough to avoid re-uploading them.
  pushedThrough = Math.max(pushedThrough, pulledThrough);

  saveSyncState(userId, {
    pulledThrough,
    pushedThrough,
    lastSyncedAt: Date.now(),
  });

  return { pulled, pushed };
}
