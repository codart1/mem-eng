"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import {
  UserRound,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  CloudOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-provider";
import { useSync } from "@/lib/sync/sync-provider";
import { useI18n } from "@/lib/i18n";

export function AccountCard() {
  const { configured, loading, user, signOut } = useAuth();
  const { status, lastSyncedAt, sync } = useSync();
  const { t, locale } = useI18n();
  const a = t.account;

  // Supabase not set up → the whole cloud layer is off; render nothing.
  if (!configured) return null;

  async function handleSignOut() {
    await signOut();
    toast.success(a.signedOut);
  }

  const lastSyncedLabel =
    lastSyncedAt > 0
      ? a.sync.lastSynced.replace(
          "{time}",
          formatDistanceToNow(lastSyncedAt, {
            addSuffix: true,
            locale: locale === "vi" ? viLocale : undefined,
          }),
        )
      : a.sync.never;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4" /> {a.title}
        </CardTitle>
        <CardDescription>{a.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="bg-muted h-9 w-40 animate-pulse rounded-md" />
        ) : user ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">{a.signedInAs}</p>
                <p className="truncate text-sm font-medium">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" /> {a.signOut}
              </Button>
            </div>

            <Separator />

            {/* Cloud sync */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">{a.sync.title}</p>
                <p className="text-muted-foreground text-xs">
                  {a.sync.description}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <SyncStatusLine
                  status={status}
                  idleLabel={lastSyncedLabel}
                  t={a.sync}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void sync()}
                  disabled={status === "syncing"}
                >
                  <RefreshCw
                    className={cn("size-4", status === "syncing" && "animate-spin")}
                  />
                  {status === "syncing" ? a.sync.syncing : a.sync.syncNow}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">{a.signedOutBody}</p>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/login" />}>{a.signIn}</Button>
              <Button variant="outline" render={<Link href="/signup" />}>
                {a.createAccount}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SyncStatusLine({
  status,
  idleLabel,
  t,
}: {
  status: ReturnType<typeof useSync>["status"];
  idleLabel: string;
  t: ReturnType<typeof useI18n>["t"]["account"]["sync"];
}) {
  if (status === "error") {
    return (
      <span className="text-destructive flex items-center gap-1.5 text-xs">
        <AlertCircle className="size-3.5" /> {t.error}
      </span>
    );
  }
  if (status === "offline") {
    return (
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <CloudOff className="size-3.5" /> {t.offline}
      </span>
    );
  }
  if (status === "syncing") {
    return (
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <RefreshCw className="size-3.5 animate-spin" /> {t.syncing}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <CheckCircle2 className="size-3.5 text-emerald-500" /> {idleLabel}
    </span>
  );
}
