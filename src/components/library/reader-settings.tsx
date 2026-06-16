"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { ReaderPrefs } from "@/lib/hooks/use-reader-prefs";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefs: ReaderPrefs;
  update: (patch: Partial<ReaderPrefs>) => void;
}

const num = (v: number | readonly number[]) => (Array.isArray(v) ? v[0] : (v as number));

export function ReaderSettings({ open, onOpenChange, prefs, update }: Props) {
  const t = useT();

  const widths: { key: ReaderPrefs["width"]; label: string }[] = [
    { key: "narrow", label: t.reader.widthNarrow },
    { key: "normal", label: t.reader.widthNormal },
    { key: "wide", label: t.reader.widthWide },
  ];
  const themes: { key: ReaderPrefs["theme"]; label: string }[] = [
    { key: "default", label: t.reader.themeDefault },
    { key: "sepia", label: t.reader.themeSepia },
    { key: "dark", label: t.reader.themeDark },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto gap-0 sm:max-w-md sm:rounded-t-xl"
      >
        <SheetHeader>
          <SheetTitle>{t.reader.settings}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-2">
          <div className="space-y-2">
            <Label>{t.reader.fontSize}</Label>
            <Slider
              min={80}
              max={160}
              step={5}
              value={Math.round(prefs.fontScale * 100)}
              onValueChange={(v) => update({ fontScale: num(v) / 100 })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.reader.lineSpacing}</Label>
            <Slider
              min={130}
              max={220}
              step={10}
              value={Math.round(prefs.lineSpacing * 100)}
              onValueChange={(v) => update({ lineSpacing: num(v) / 100 })}
            />
          </div>

          <Segmented
            label={t.reader.pageWidth}
            options={widths}
            value={prefs.width}
            onChange={(width) => update({ width })}
          />

          <Segmented
            label={t.reader.theme}
            options={themes}
            value={prefs.theme}
            onChange={(theme) => update({ theme })}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="bg-muted grid grid-flow-col gap-1 rounded-lg p-1">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              value === opt.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
