"use client";

import { useEffect, useRef } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SuggestedSet } from "@/lib/ai/chat";
import { useAddWordSet } from "@/lib/hooks/use-add-word-set";
import { useT } from "@/lib/i18n";

/**
 * Renders a vocab set the assistant proposed, with a one-tap "Add as deck"
 * action that generates a full card for each word (see {@link useAddWordSet}).
 */
export function SuggestedSetCard({ set }: { set: SuggestedSet }) {
  const t = useT();
  const { status, progress, added, add } = useAddWordSet();
  const notified = useRef(false);

  // Toast exactly once when the add settles (success or failure).
  useEffect(() => {
    if (notified.current) return;
    if (status === "done") {
      notified.current = true;
      toast.success(
        t.assistant.addedToast
          .replace("{title}", set.title)
          .replace("{count}", String(added)),
        added < set.words.length
          ? {
              description: t.assistant.someFailed
                .replace("{added}", String(added))
                .replace("{total}", String(set.words.length)),
            }
          : undefined,
      );
    } else if (status === "error") {
      notified.current = true;
      toast.error(t.assistant.addFailed);
    }
  }, [status, added, set, t]);

  const statusText =
    status === "adding"
      ? `${progress.done}/${progress.total}`
      : t.assistant.words.replace("{count}", String(set.words.length));

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-base font-semibold tracking-tight">
            {set.title}
          </h4>
          {set.level && (
            <Badge variant="secondary" className="shrink-0">
              {set.level}
            </Badge>
          )}
        </div>

        {set.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {set.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {set.words.map((w) => (
            <span
              key={w}
              className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-medium"
            >
              {w}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="text-muted-foreground text-xs">{statusText}</span>
          {status === "done" ? (
            <Button size="sm" variant="ghost" disabled>
              <Check className="size-4" /> {t.assistant.added}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => void add(set)}
              disabled={status === "adding"}
            >
              {status === "adding" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> {t.assistant.adding}
                </>
              ) : (
                <>
                  <Plus className="size-4" /> {t.assistant.add}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
