"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { syncNow } from "./engine";
import { loadSyncState } from "./state";

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

interface SyncContextValue {
  /** True only when signed in AND Supabase is configured. */
  enabled: boolean;
  status: SyncStatus;
  lastSyncedAt: number;
  error: string | null;
  /** Manually trigger a sync pass. No-op when not enabled. */
  sync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const userId = user?.id ?? null;
  const enabled = userId !== null && supabase !== null;

  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(0);

  // Prevent overlapping passes; remember if another was requested mid-flight.
  const running = useRef(false);
  const rerun = useRef(false);

  const sync = useCallback(async () => {
    if (!enabled || !supabase || !userId) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus("offline");
      return;
    }
    // Coalesce overlapping calls: a request mid-flight just flags a re-run, which
    // the loop below picks up — no recursion, so this stays memoizable.
    if (running.current) {
      rerun.current = true;
      return;
    }

    running.current = true;
    try {
      do {
        rerun.current = false;
        setStatus("syncing");
        setError(null);
        try {
          await syncNow(supabase, userId);
          setLastSyncedAt(loadSyncState(userId).lastSyncedAt);
          setStatus("idle");
        } catch (err) {
          console.error("sync failed", err);
          setError(err instanceof Error ? err.message : "Sync failed.");
          setStatus("error");
        }
      } while (rerun.current);
    } finally {
      running.current = false;
    }
  }, [enabled, supabase, userId]);

  // Hydrate last-synced display and kick an initial sync whenever the user changes.
  useEffect(() => {
    if (!enabled || !userId) {
      setStatus("idle");
      setLastSyncedAt(0);
      return;
    }
    setLastSyncedAt(loadSyncState(userId).lastSyncedAt);
    void sync();
  }, [enabled, userId, sync]);

  // Re-sync when the tab regains focus or the network comes back.
  useEffect(() => {
    if (!enabled) return;
    const onFocus = () => void sync();
    const onOnline = () => void sync();
    const onOffline = () => setStatus("offline");
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [enabled, sync]);

  const value = useMemo<SyncContextValue>(
    () => ({ enabled, status, lastSyncedAt, error, sync }),
    [enabled, status, lastSyncedAt, error, sync],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within a SyncProvider");
  return ctx;
}
