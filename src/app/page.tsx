"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  BarChart3,
  CalendarClock,
  Check,
  ChevronDown,
  Layers,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Volume2,
  Wand2,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";
import { useI18n } from "@/lib/i18n";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-dvh">
      <LandingNav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Showcase />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}

/* ------------------------------- Hero ------------------------------- */

function Hero() {
  const { t } = useI18n();
  const h = t.landing.hero;
  const s = t.landing.stats;

  return (
    <section className="relative overflow-hidden">
      <div className="landing-aurora pointer-events-none absolute inset-0 -z-10" />
      <div className="landing-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pt-24 lg:pb-28">
        {/* Copy */}
        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-xl duration-700">
          <span className="bg-card/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
            <Sparkles className="text-brand size-3.5" />
            {h.badge}
          </span>

          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {h.title}
          </h1>

          <p className="text-muted-foreground mt-5 text-lg leading-relaxed text-pretty">
            {h.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-12 px-6 text-base shadow-sm"
              render={<Link href="/dashboard" />}
            >
              {h.ctaPrimary}
              <ArrowRight className="size-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base"
              render={<a href="#how" />}
            >
              {h.ctaSecondary}
            </Button>
          </div>

          <p className="text-muted-foreground/80 mt-4 flex items-center gap-2 text-sm">
            <Check className="text-success size-4" />
            {h.note}
          </p>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            <Stat value="90%" label={s.retention} />
            <Stat value="100%" label={s.offline} />
            <Stat value={s.freeValue} label={s.free} />
          </dl>
        </div>

        {/* Flashcard visual */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </dt>
      <dd className="text-muted-foreground mt-0.5 text-xs leading-tight">{label}</dd>
    </div>
  );
}

function HeroCard() {
  const { t } = useI18n();
  const h = t.landing.hero;

  return (
    <div className="relative">
      {/* glow */}
      <div className="bg-brand/20 absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl" />

      {/* floating mini cards */}
      <div className="bg-card animate-float-soft absolute -top-6 -left-6 z-10 hidden items-center gap-2 rounded-xl border p-2.5 pr-3.5 shadow-lg sm:flex">
        <span className="bg-amber/15 text-amber grid size-8 place-items-center rounded-lg">
          <CalendarClock className="size-4" />
        </span>
        <div className="text-xs">
          <p className="font-semibold">12</p>
          <p className="text-muted-foreground">{h.floatDue}</p>
        </div>
      </div>
      <div
        className="bg-card animate-float-soft absolute -right-5 -bottom-6 z-10 hidden items-center gap-2 rounded-xl border p-2.5 pr-3.5 shadow-lg sm:flex"
        style={{ animationDelay: "1.5s" }}
      >
        <span className="bg-success/15 text-success grid size-8 place-items-center rounded-lg">
          <BarChart3 className="size-4" />
        </span>
        <div className="text-xs">
          <p className="font-semibold">{h.floatStreak} 🔥</p>
          <p className="text-muted-foreground">{h.floatKeep}</p>
        </div>
      </div>

      {/* the card */}
      <div className="bg-card relative overflow-hidden rounded-3xl border p-7 shadow-xl sm:p-8">
        <div className="aurora-glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {h.cardPos}
            </span>
            <span className="bg-muted text-muted-foreground inline-flex size-8 items-center justify-center rounded-full">
              <Volume2 className="size-4" />
            </span>
          </div>

          <h3 className="mt-4 font-serif text-4xl font-semibold tracking-tight">
            {h.cardWord}
          </h3>
          <p className="text-muted-foreground mt-1 font-mono text-sm">/əˈfem(ə)rəl/</p>

          <p className="mt-5 text-base leading-relaxed">{h.cardDef}</p>
          <p className="text-muted-foreground mt-3 border-l-2 pl-3 text-sm italic">
            {h.cardExample}
          </p>

          <div className="mt-7 grid grid-cols-3 gap-2">
            <RatingPill color="var(--rating-again)" label={h.again} />
            <RatingPill color="var(--rating-good)" label={h.good} />
            <RatingPill color="var(--rating-easy)" label={h.easy} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingPill({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="flex h-10 items-center justify-center rounded-lg text-sm font-medium"
      style={{
        color,
        backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`,
      }}
    >
      {label}
    </div>
  );
}

/* ------------------------------ Problem ----------------------------- */

const PROBLEM_ICONS: LucideIcon[] = [TrendingDown, Layers, Brain];

function Problem() {
  const { t } = useI18n();
  const p = t.landing.problem;

  return (
    <Section id="problem">
      <SectionHeading kicker={p.kicker} title={p.title} subtitle={p.subtitle} />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {p.items.map((item, i) => {
          const Icon = PROBLEM_ICONS[i] ?? Brain;
          return (
            <Reveal key={item.title} delay={i * 90}>
              <div className="bg-card h-full rounded-2xl border p-6">
                <span className="bg-destructive/10 text-destructive grid size-11 place-items-center rounded-xl">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------------------------- How it works -------------------------- */

const HOW_ICONS: LucideIcon[] = [Wand2, CalendarClock, LineChart];

function HowItWorks() {
  const { t } = useI18n();
  const h = t.landing.how;

  return (
    <Section id="how" className="relative overflow-hidden">
      <div className="landing-aurora pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <SectionHeading kicker={h.kicker} title={h.title} subtitle={h.subtitle} />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {h.steps.map((step, i) => {
          const Icon = HOW_ICONS[i] ?? Wand2;
          return (
            <Reveal key={step.title} delay={i * 110}>
              <div className="relative h-full">
                <div className="bg-card h-full rounded-2xl border p-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-brand text-brand-foreground grid size-11 place-items-center rounded-xl shadow-sm">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-muted-foreground/40 font-serif text-4xl font-semibold">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ----------------------------- Features ----------------------------- */

const FEATURE_ICONS: LucideIcon[] = [
  Wand2,
  CalendarClock,
  WifiOff,
  ShieldCheck,
  Layers,
  BarChart3,
];

const FEATURE_ACCENTS = [
  "var(--brand)",
  "var(--rating-easy)",
  "var(--success)",
  "var(--amber)",
  "var(--chart-4)",
  "var(--chart-2)",
];

function Features() {
  const { t } = useI18n();
  const f = t.landing.features;

  return (
    <Section id="features">
      <SectionHeading kicker={f.kicker} title={f.title} subtitle={f.subtitle} />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {f.items.map((item, i) => {
          const Icon = FEATURE_ICONS[i] ?? Sparkles;
          const accent = FEATURE_ACCENTS[i] ?? "var(--brand)";
          return (
            <Reveal key={item.title} delay={(i % 3) * 80}>
              <div className="bg-card group hover:border-brand/40 h-full rounded-2xl border p-6 transition-colors">
                <span
                  className="grid size-11 place-items-center rounded-xl transition-transform group-hover:scale-105"
                  style={{
                    color: accent,
                    backgroundColor: `color-mix(in oklch, ${accent} 14%, transparent)`,
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ----------------------------- Showcase ----------------------------- */

function Showcase() {
  const { t } = useI18n();
  const s = t.landing.showcase;

  return (
    <Section>
      <div className="bg-card relative overflow-hidden rounded-3xl border p-8 sm:p-12">
        <div className="aurora-glow pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-brand text-sm font-semibold tracking-wide uppercase">
              {s.kicker}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {s.title}
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              {s.subtitle}
            </p>
            <ul className="mt-6 space-y-3">
              {s.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="bg-success/15 text-success mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-sm leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mini dashboard mock */}
          <Reveal className="relative">
            <div className="bg-background/60 rounded-2xl border p-5 shadow-lg backdrop-blur">
              <div className="grid grid-cols-3 gap-3">
                <MockStat value="12" label="Due" accent="var(--rating-good)" />
                <MockStat value="8" label="New" accent="var(--brand)" />
                <MockStat value="7" label="Streak" accent="var(--amber)" />
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { name: "TOEFL Essentials", n: 240, c: "var(--chart-1)" },
                  { name: "Phrasal Verbs", n: 96, c: "var(--chart-3)" },
                  { name: "Academic Writing", n: 152, c: "var(--chart-4)" },
                ].map((deck) => (
                  <div
                    key={deck.name}
                    className="bg-card flex items-center gap-3 rounded-xl border p-3"
                  >
                    <span
                      className="size-9 shrink-0 rounded-lg"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${deck.c} 22%, transparent)`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{deck.name}</p>
                      <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: "62%", backgroundColor: deck.c }}
                        />
                      </div>
                    </div>
                    <span className="text-muted-foreground text-xs">{deck.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function MockStat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{ backgroundColor: `color-mix(in oklch, ${accent} 8%, transparent)` }}
    >
      <p className="font-serif text-2xl font-semibold" style={{ color: accent }}>
        {value}
      </p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

/* ------------------------------- FAQ -------------------------------- */

function Faq() {
  const { t } = useI18n();
  const f = t.landing.faq;

  return (
    <Section id="faq">
      <div className="mx-auto max-w-3xl">
        <SectionHeading kicker={f.kicker} title={f.title} />
        <div className="mt-10 space-y-3">
          {f.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 60}>
              <details className="group bg-card rounded-2xl border px-5 open:shadow-sm [&_summary]:list-none">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-medium">
                  {item.q}
                  <ChevronDown className="text-muted-foreground size-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="text-muted-foreground pb-5 text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------- Final CTA ---------------------------- */

function FinalCta() {
  const { t } = useI18n();
  const c = t.landing.cta;

  return (
    <Section>
      <div className="bg-brand text-brand-foreground relative overflow-hidden rounded-3xl px-8 py-14 text-center shadow-lg sm:px-12 sm:py-20">
        <div className="aurora-glow pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {c.title}
          </h2>
          <p className="mt-4 text-base opacity-90 sm:text-lg">{c.subtitle}</p>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 px-7 text-base shadow-sm"
              render={<Link href="/dashboard" />}
            >
              {c.button}
              <ArrowRight className="size-5" />
            </Button>
          </div>
          <p className="mt-4 text-sm opacity-75">{c.note}</p>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------- Layout helpers ------------------------- */

function Section({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        {children}
      </div>
    </section>
  );
}

function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-brand text-sm font-semibold tracking-wide uppercase">
        {kicker}
      </p>
      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
