"use client";

import { useEffect, useRef, useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCredits } from "@/lib/credits/credits-provider";
import { CREDIT_PACKS } from "@/lib/credits/packs";
import { useI18n } from "@/lib/i18n";

export function CreditsSection() {
  const { balance, loading, refresh } = useCredits();
  const { t } = useI18n();
  const c = t.account.credits;
  const [pendingPack, setPendingPack] = useState<string | null>(null);

  // After returning from a successful Lemon Squeezy checkout, the webhook may
  // lag a beat — poll a few times so the new balance shows up.
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchase") !== "success") return;
    toast.success(c.purchaseSuccess);
    let n = 0;
    const timer = setInterval(() => {
      void refresh();
      if (++n >= 5) clearInterval(timer);
    }, 2000);
    params.delete("purchase");
    const q = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (q ? `?${q}` : ""));
    return () => clearInterval(timer);
  }, [c.purchaseSuccess, refresh]);

  async function buy(packId: string) {
    setPendingPack(packId);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        toast.error(res.status === 501 ? c.unavailable : data.error || c.failed);
        return;
      }
      if (data.url) {
        toast.message(c.opening);
        window.location.assign(data.url);
      }
    } catch {
      toast.error(c.failed);
    } finally {
      setPendingPack(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Coins className="size-4" /> {c.title}
          </p>
          <p className="text-muted-foreground text-xs">{c.description}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">{c.balance}</p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {loading && balance === null ? "—" : (balance ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CREDIT_PACKS.map((pack) => (
          <button
            key={pack.id}
            onClick={() => buy(pack.id)}
            disabled={pendingPack !== null}
            className={cn(
              "relative flex flex-col items-center gap-0.5 rounded-lg border p-3 text-center transition-colors disabled:opacity-60",
              pack.featured
                ? "border-brand/40 bg-brand/5 hover:bg-brand/10"
                : "hover:bg-muted",
            )}
          >
            <span className="text-sm font-semibold tabular-nums">
              {pack.credits}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {c.pack.replace("{credits}", "").trim()}
            </span>
            <span className="text-xs font-medium">{pack.priceHint}</span>
            {pendingPack === pack.id && (
              <Loader2 className="absolute right-1.5 top-1.5 size-3.5 animate-spin" />
            )}
          </button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">{c.lowNote}</p>
    </div>
  );
}
