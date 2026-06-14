"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LandingFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const links = [
    { href: "#features", label: t.landing.nav.features },
    { href: "#how", label: t.landing.nav.how },
    { href: "#faq", label: t.landing.nav.faq },
    { href: "/dashboard", label: t.landing.nav.open },
  ];

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="bg-brand text-brand-foreground grid size-7 place-items-center rounded-lg">
              <Sparkles className="size-4" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">
              Lexio
            </span>
          </Link>
          <p className="text-muted-foreground text-sm">{t.landing.footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t">
        <p className="text-muted-foreground/70 mx-auto w-full max-w-6xl px-4 py-4 text-center text-xs sm:px-6">
          © {year} Lexio · {t.landing.footer.rights}
        </p>
      </div>
    </footer>
  );
}
