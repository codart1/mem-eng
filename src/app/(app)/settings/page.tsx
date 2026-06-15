"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Languages,
  Download,
  Upload,
  Trash2,
  KeyRound,
  Brain,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { useSettings } from "@/lib/hooks/use-data";
import { repository } from "@/lib/db/dexie-repository";
import type { DataSnapshot } from "@/lib/db/repository";
import { AI_PROVIDERS, type AiProvider } from "@/lib/types";

export default function SettingsPage() {
  const settings = useSettings();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  // next-themes only knows the active theme after mount; gate the active state
  // so the segmented control doesn't trigger a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Local mirror, hydrated once from the persisted settings.
  const hydrated = useRef(false);
  const [retention, setRetention] = useState(90);
  const [maxInterval, setMaxInterval] = useState(36500);
  const [fuzz, setFuzz] = useState(true);
  const [newLimit, setNewLimit] = useState(20);
  const [reviewLimit, setReviewLimit] = useState(200);
  const [provider, setProvider] = useState<AiProvider>("claude");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (hydrated.current || settings.updatedAt === 0) return;
    hydrated.current = true;
    setRetention(Math.round(settings.requestRetention * 100));
    setMaxInterval(settings.maximumInterval);
    setFuzz(settings.enableFuzz);
    setNewLimit(settings.dailyNewLimit);
    setReviewLimit(settings.dailyReviewLimit);
    setProvider(settings.aiProvider);
    setAnthropicKey(settings.byokApiKey ?? "");
    setOpenaiKey(settings.openaiApiKey ?? "");
  }, [settings]);

  async function changeProvider(next: AiProvider) {
    setProvider(next);
    await repository.settings.update({ aiProvider: next });
  }

  async function saveScheduling() {
    await repository.settings.update({
      requestRetention: Math.min(0.97, Math.max(0.7, retention / 100)),
      maximumInterval: Math.max(1, maxInterval),
      enableFuzz: fuzz,
      dailyNewLimit: Math.max(0, newLimit),
      dailyReviewLimit: Math.max(0, reviewLimit),
    });
    toast.success(t.settings.schedulingSaved);
  }

  async function saveApiKey() {
    const value = (provider === "openai" ? openaiKey : anthropicKey).trim();
    await repository.settings.update(
      provider === "openai"
        ? { openaiApiKey: value || undefined }
        : { byokApiKey: value || undefined },
    );
    toast.success(value ? t.settings.apiKeySaved : t.settings.apiKeyCleared);
  }

  async function handleExport() {
    const snapshot = await repository.export();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lexio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.settings.backupDownloaded);
  }

  async function handleImport(file: File) {
    try {
      const snapshot = JSON.parse(await file.text()) as DataSnapshot;
      if (!snapshot.version || !Array.isArray(snapshot.decks)) {
        throw new Error(t.settings.importInvalid);
      }
      await repository.import(snapshot, "merge");
      toast.success(t.settings.backupImported);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : t.settings.importFailed);
    }
  }

  const themes = [
    { key: "system", label: t.settings.themeSystem, icon: Monitor },
    { key: "light", label: t.settings.themeLight, icon: Sun },
    { key: "dark", label: t.settings.themeDark, icon: Moon },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t.settings.title} description={t.settings.description} />

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.appearance}</CardTitle>
          <CardDescription>{t.settings.appearanceDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-muted inline-flex rounded-lg p-1">
            {themes.map((opt) => {
              const Icon = opt.icon;
              const active = mounted && theme === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" /> {opt.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="size-4" /> {t.language.label}
            </Label>
            <div className="bg-muted inline-flex rounded-lg p-1">
              {LOCALES.map((loc) => {
                const active = locale === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => setLocale(loc)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {LOCALE_LABELS[loc]}
                  </button>
                );
              })}
            </div>
            <p className="text-muted-foreground text-xs">{t.language.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" /> {t.settings.scheduling}
          </CardTitle>
          <CardDescription>{t.settings.schedulingDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.settings.targetRetention}</Label>
              <span className="text-muted-foreground font-mono text-sm">{retention}%</span>
            </div>
            <Slider
              value={[retention]}
              min={80}
              max={97}
              step={1}
              onValueChange={(v) =>
                setRetention(Array.isArray(v) ? (v[0] ?? 90) : v)
              }
            />
            <p className="text-muted-foreground text-xs">{t.settings.retentionHint}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-limit">{t.settings.newPerDay}</Label>
              <Input
                id="new-limit"
                type="number"
                min={0}
                value={newLimit}
                onChange={(e) => setNewLimit(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rev-limit">{t.settings.reviewsPerDay}</Label>
              <Input
                id="rev-limit"
                type="number"
                min={0}
                value={reviewLimit}
                onChange={(e) => setReviewLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="fuzz">{t.settings.intervalFuzz}</Label>
              <p className="text-muted-foreground text-xs">{t.settings.fuzzHint}</p>
            </div>
            <Switch id="fuzz" checked={fuzz} onCheckedChange={setFuzz} />
          </div>

          <Button onClick={saveScheduling}>{t.settings.saveScheduling}</Button>
        </CardContent>
      </Card>

      {/* AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" /> {t.settings.ai}
          </CardTitle>
          <CardDescription>{t.settings.aiDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>{t.settings.aiProvider}</Label>
            <div className="bg-muted inline-flex rounded-lg p-1">
              {AI_PROVIDERS.map((p) => {
                const active = provider === p;
                return (
                  <button
                    key={p}
                    onClick={() => changeProvider(p as AiProvider)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t.settings.providerNames[p]}
                  </button>
                );
              })}
            </div>
            <p className="text-muted-foreground text-xs">
              {t.settings.providerHints[provider]}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">
              {provider === "openai"
                ? t.settings.openaiKeyLabel
                : t.settings.apiKeyLabel}
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder={provider === "openai" ? "sk-…" : "sk-ant-…"}
                value={provider === "openai" ? openaiKey : anthropicKey}
                onChange={(e) =>
                  provider === "openai"
                    ? setOpenaiKey(e.target.value)
                    : setAnthropicKey(e.target.value)
                }
                className="font-mono"
              />
              <Button variant="outline" onClick={saveApiKey}>
                {t.common.save}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">{t.settings.apiKeyHint}</p>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-4" /> {t.settings.data}
          </CardTitle>
          <CardDescription>{t.settings.dataDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4" /> {t.settings.exportBackup}
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> {t.settings.importBackup}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImport(file);
                e.target.value = "";
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t.settings.resetEverything}</p>
              <p className="text-muted-foreground text-xs">
                {t.settings.resetEverythingDesc}
              </p>
            </div>
            <Button variant="destructive" onClick={() => setResetOpen(true)}>
              <Trash2 className="size-4" /> {t.settings.reset}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={t.settings.resetTitle}
        description={t.settings.resetDescription}
        confirmLabel={t.settings.resetConfirm}
        destructive
        onConfirm={async () => {
          await repository.reset();
          if (typeof window !== "undefined") {
            localStorage.removeItem("lexio.seeded");
            window.location.href = "/dashboard";
          }
        }}
      />
    </div>
  );
}
