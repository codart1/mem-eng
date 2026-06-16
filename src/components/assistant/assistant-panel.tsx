"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UseChat, AssistantMessage } from "@/lib/hooks/use-chat";
import { useT } from "@/lib/i18n";
import { SuggestedSetCard } from "./suggested-set-card";

/**
 * The chat surface — message list, starters, and the composer. State lives in
 * the parent (so it survives opening/closing the sheet within a session).
 */
export function AssistantPanel({ chat }: { chat: UseChat }) {
  const t = useT();
  const { messages, send, isLoading, error } = chat;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function submit() {
    const text = input.trim();
    if (!text || isLoading) return;
    send(text);
    setInput("");
  }

  const starters = [
    t.assistant.starterSummary,
    t.assistant.starterSuggest,
    t.assistant.starterWeak,
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-4 py-6">
            <div className="bg-muted/60 text-muted-foreground rounded-xl p-4 text-sm leading-relaxed">
              {t.assistant.greeting}
            </div>
            <div className="flex flex-col gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="hover:bg-muted flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors"
                >
                  <Sparkles className="text-brand size-4 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                {t.assistant.thinking}
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={t.assistant.placeholder}
            rows={1}
            className="max-h-32 min-h-0 flex-1 resize-none py-2"
          />
          <Button
            size="icon"
            onClick={submit}
            disabled={!input.trim() || isLoading}
            aria-label={t.assistant.send}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: AssistantMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-brand text-brand-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {message.content}
      </div>
      {message.suggestedSets?.map((set, i) => (
        <div key={`${message.id}-${i}`} className="w-full max-w-[85%]">
          <SuggestedSetCard set={set} />
        </div>
      ))}
    </div>
  );
}
