"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: t.landing.nav.features },
    { href: "#how", label: t.landing.nav.how },
    { href: "#faq", label: t.landing.nav.faq },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-background/80 border-b backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="bg-brand text-brand-foreground grid size-8 place-items-center rounded-lg shadow-sm">
            <Sparkles className="size-4.5" />
          </span>
          <span className="font-serif text-xl leading-none font-semibold tracking-tight">
            Lexio
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            size="sm"
            className="ml-1 shadow-sm"
            render={<Link href="/dashboard" />}
          >
            {t.landing.nav.open}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
