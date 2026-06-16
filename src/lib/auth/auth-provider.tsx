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
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Result of an auth action — a user-facing error and/or a needs-confirmation hint. */
export interface AuthResult {
  error?: string;
  /** True when sign-up succeeded but email confirmation is required before login. */
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  /** True only when Supabase env vars are present; otherwise the whole cloud layer is off. */
  configured: boolean;
  /** Still resolving the initial session. */
  loading: boolean;
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Map Supabase auth errors onto short, friendly messages. */
function friendly(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login")) return "Incorrect email or password.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists.";
  if (m.includes("password")) return message ?? "Password is too weak.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  return message || "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const configured = supabase !== null;

  const [loading, setLoading] = useState(configured);
  const [session, setSession] = useState<Session | null>(null);
  const user = session?.user ?? null;

  // Guard against setState after unmount during the async initial fetch.
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted.current) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted.current) return;
      setSession(next);
      setLoading(false);
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async (email, password) => {
      if (!supabase) return { error: "Cloud accounts aren't available." };
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: friendly(error.message) };
      // When email confirmation is on, no session is returned yet.
      return { needsConfirmation: !data.session };
    },
    [supabase],
  );

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password) => {
      if (!supabase) return { error: "Cloud accounts aren't available." };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: friendly(error.message) };
      return {};
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ configured, loading, user, session, signUp, signIn, signOut }),
    [configured, loading, user, session, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
