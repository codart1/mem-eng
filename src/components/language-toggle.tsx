"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT } from "@/lib/i18n/config";

/**
 * Compact language switcher. Cycles through supported locales; shows the
 * current locale's two-letter label. Used in the app shell and landing nav.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  function cycle() {
    const i = LOCALES.indexOf(locale);
    const next = LOCALES[(i + 1) % LOCALES.length];
    setLocale(next);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={cycle}
      aria-label={`${t.language.label}: ${LOCALE_LABELS[locale]}`}
      title={LOCALE_LABELS[locale]}
    >
      <Languages className="size-4" />
      <span className="font-medium">{LOCALE_SHORT[locale]}</span>
    </Button>
  );
}
