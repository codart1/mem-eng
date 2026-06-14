"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  Sparkles,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { DueBadge } from "./due-badge";

type NavItem = {
  href: string;
  labelKey: keyof Dictionary["nav"];
  icon: LucideIcon;
  showDue?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/decks", labelKey: "decks", icon: Layers },
  { href: "/study", labelKey: "study", icon: GraduationCap, showDue: true },
  { href: "/create", labelKey: "create", icon: Sparkles },
  { href: "/stats", labelKey: "stats", icon: BarChart3 },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="bg-brand text-brand-foreground grid size-9 place-items-center rounded-xl shadow-sm">
        <Sparkles className="size-5" />
      </span>
      <span className="font-serif text-2xl leading-none font-semibold tracking-tight">
        Lexio
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useT();

  return (
    <div className="flex min-h-dvh w-full">
      {/* Desktop sidebar */}
      <aside className="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r p-4 md:flex">
        <div className="px-2 py-3">
          <Wordmark />
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-[18px]" />
                <span className="flex-1">{t.nav[item.labelKey]}</span>
                {item.showDue && <DueBadge />}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-muted-foreground px-2 text-xs">
            {t.nav.offlineFirst}
          </span>
          <div className="flex items-center">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="bg-background/80 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur md:hidden">
          <Wordmark />
          <div className="flex items-center">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bg-background/90 fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t backdrop-blur md:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                active ? "text-brand" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              <span>{t.nav[item.labelKey]}</span>
              {item.showDue && (
                <span className="absolute top-1 right-[22%]">
                  <DueBadge compact />
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
