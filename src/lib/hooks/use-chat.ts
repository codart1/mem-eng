"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { buildLearnerSnapshot } from "@/lib/ai/learner-context";
import type { ChatMessage, ChatResult, SuggestedSet } from "@/lib/ai/chat";
import { uid } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useAllCards, useAllLogs, useDecks, useSettings } from "./use-data";

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Attached to assistant turns that propose vocabulary. */
  suggestedSets?: SuggestedSet[];
}

export interface UseChat {
  messages: AssistantMessage[];
  send: (text: string) => void;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Ephemeral, in-memory chat session (cleared on reload). Builds a learner-data
 * snapshot from the live Dexie hooks and posts it with the conversation to
 * /api/chat, resolving the provider + key exactly like {@link useGenerateWord}.
 */
export function useChat(): UseChat {
  const t = useT();
  const decks = useDecks();
  const cards = useAllCards();
  const logs = useAllLogs();
  const settings = useSettings();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  const mutation = useMutation<
    ChatResult,
    Error,
    { history: ChatMessage[] }
  >({
    mutationFn: async ({ history }) => {
      const snapshot = buildLearnerSnapshot(
        decks ?? [],
        cards ?? [],
        logs ?? [],
        settings,
      );
      const apiKey =
        settings.aiProvider === "openai"
          ? settings.openaiApiKey
          : settings.byokApiKey;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history,
          snapshot: JSON.stringify(snapshot),
          provider: settings.aiProvider,
          apiKey: apiKey || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        suggestedSets?: SuggestedSet[];
        error?: string;
      };
      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? t.assistant.error);
      }
      return { reply: data.reply, suggestedSets: data.suggestedSets ?? [] };
    },
    onSuccess: (result) => {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: result.reply,
          suggestedSets: result.suggestedSets.length
            ? result.suggestedSets
            : undefined,
        },
      ]);
    },
  });

  const { mutate, isPending, reset: resetMutation } = mutation;

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isPending) return;
      const userMsg: AssistantMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
      };
      // History sent to the server is only the conversational text, not the
      // local-only message ids / attached sets.
      const history: ChatMessage[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      setMessages((prev) => [...prev, userMsg]);
      mutate({ history });
    },
    [messages, isPending, mutate],
  );

  const reset = useCallback(() => {
    setMessages([]);
    resetMutation();
  }, [resetMutation]);

  return {
    messages,
    send,
    isLoading: isPending,
    error: mutation.error?.message ?? null,
    reset,
  };
}
