/**
 * Per-user sync high-water marks, persisted in localStorage. All clocks are on
 * the client's epoch-ms scale (records carry `updatedAt` from `now()`), so push
 * and pull marks are directly comparable.
 *
 * - `pulledThrough`: the largest remote `updated_at` we've already applied.
 * - `pushedThrough`: the largest local `updatedAt` already on the server.
 * - `lastSyncedAt`: wall-clock of the last successful sync, for display only.
 */
export interface SyncState {
  pulledThrough: number;
  pushedThrough: number;
  lastSyncedAt: number;
}

const EMPTY: SyncState = { pulledThrough: 0, pushedThrough: 0, lastSyncedAt: 0 };

const key = (userId: string) => `lexio.sync.${userId}`;

export function loadSyncState(userId: string): SyncState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(key(userId));
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<SyncState>;
    return {
      pulledThrough: parsed.pulledThrough ?? 0,
      pushedThrough: parsed.pushedThrough ?? 0,
      lastSyncedAt: parsed.lastSyncedAt ?? 0,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveSyncState(userId: string, state: SyncState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(state));
  } catch {
    // Storage full / unavailable — sync still works, just re-pulls next time.
  }
}

export function clearSyncState(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(userId));
  } catch {
    /* ignore */
  }
}
