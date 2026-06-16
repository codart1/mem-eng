"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  Sparkles,
  Compass,
  Newspaper,
  BookOpen,
  BarChart3,
  Settings,
  Home,
  Plus,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LexioMark } from "@/components/brand/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  { href: "/discover", labelKey: "discover", icon: Compass },
  { href: "/news", labelKey: "news", icon: Newspaper },
  { href: "/library", labelKey: "library", icon: BookOpen },
  { href: "/study", labelKey: "study", icon: GraduationCap, showDue: true },
  { href: "/create", labelKey: "create", icon: Sparkles },
  { href: "/stats", labelKey: "stats", icon: BarChart3 },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

const byHref = (href: string) => NAV.find((item) => item.href === href)!;

// The compact mobile bar surfaces only the daily-loop destinations: two tabs on
// each side of a raised "Create" button. Everything else lives in the More sheet.
const PRIMARY_TABS = ["/dashboard", "/decks", "/news", "/study"].map(byHref);
const CREATE_ITEM = byHref("/create");
const MORE_ITEMS = ["/library", "/discover", "/stats", "/settings"].map(byHref);

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BottomTab({
  item,
  active,
  label,
}: {
  item: NavItem;
  active: boolean;
  label: string;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
        active ? "text-brand" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" />
      <span>{label}</span>
      {item.showDue && (
        <span className="absolute top-1 right-[22%]">
          <DueBadge compact />
        </span>
      )}
    </Link>
  );
}

function Wordmark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <LexioMark />
      <span className="font-serif text-2xl leading-none font-semibold tracking-tight">
        Lexio
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useT();
  const [moreOpen, setMoreOpen] = useState(false);

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
          <Link
            href="/"
            className="group text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <Home className="size-[18px]" />
            <span className="flex-1">{t.nav.landing}</span>
          </Link>
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
            <Link
              href="/"
              aria-label={t.nav.landing}
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors"
            >
              <Home className="size-5" />
            </Link>
            <LanguageToggle />
            <ThemeToggle />
            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger
                aria-label={t.nav.more}
                className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors"
              >
                <MoreHorizontal className="size-5" />
              </SheetTrigger>
              <SheetContent side="bottom" className="pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
                <SheetHeader>
                  <SheetTitle>{t.nav.more}</SheetTitle>
                </SheetHeader>
                <nav className="grid grid-cols-3 gap-2 px-4 pb-2">
                  {MORE_ITEMS.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors",
                          active
                            ? "border-brand/40 bg-brand/10 text-brand"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="size-5" />
                        <span>{t.nav[item.labelKey]}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav: two tabs, a raised Create button, two more tabs. */}
      <nav
        className="bg-background/90 fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {PRIMARY_TABS.slice(0, 2).map((item) => (
          <BottomTab
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            label={t.nav[item.labelKey]}
          />
        ))}

        {/* Center "Create" — raised so it reads as the primary action. */}
        <div className="relative flex flex-1 items-center justify-center">
          <Link
            href={CREATE_ITEM.href}
            aria-label={t.nav[CREATE_ITEM.labelKey]}
            className={cn(
              "ring-background absolute -top-5 flex size-14 items-center justify-center rounded-full shadow-lg ring-4 transition-transform active:scale-95",
              isActive(pathname, CREATE_ITEM.href)
                ? "bg-brand text-brand-foreground ring-brand/30"
                : "bg-brand text-brand-foreground",
            )}
          >
            <Plus className="size-6" />
          </Link>
        </div>

        {PRIMARY_TABS.slice(2).map((item) => (
          <BottomTab
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            label={t.nav[item.labelKey]}
          />
        ))}
      </nav>
    </div>
  );
}
