"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface CreditsContextValue {
  /** True when accounts are available and a user is signed in. */
  enabled: boolean;
  /** Current balance, or null while unknown/loading. */
  balance: number | null;
  loading: boolean;
  /** Re-read the balance from the server (e.g. after a purchase or an AI call). */
  refresh: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const userId = user?.id ?? null;
  const enabled = userId !== null && supabase !== null;

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase || !userId) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      setBalance((data?.balance as number | undefined) ?? 0);
    } catch (err) {
      console.error("credits fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (!enabled) {
      setBalance(null);
      return;
    }
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enabled, refresh]);

  const value = useMemo<CreditsContextValue>(
    () => ({ enabled, balance, loading, refresh }),
    [enabled, balance, loading, refresh],
  );

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
}

export function useCredits(): CreditsContextValue {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within a CreditsProvider");
  return ctx;
}
