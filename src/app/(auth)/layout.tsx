"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LexioMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useAuth } from "@/lib/auth/auth-provider";
import { useT } from "@/lib/i18n";

/**
 * Focused, nav-free shell for the auth screens. Already-signed-in users are
 * bounced to the dashboard; if Supabase isn't configured the auth routes
 * effectively don't apply, so we also redirect home.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, configured, loading } = useAuth();
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    if (!configured) router.replace("/dashboard");
    else if (!loading && user) router.replace("/dashboard");
  }, [configured, loading, user, router]);

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LexioMark />
          <span className="font-serif text-xl leading-none font-semibold tracking-tight">
            Lexio
          </span>
        </Link>
        <div className="flex items-center">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {children}
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground mt-8 flex items-center justify-center gap-1.5 text-sm"
          >
            <ArrowLeft className="size-4" /> {t.account.backToApp}
          </Link>
        </div>
      </main>
    </div>
  );
}
