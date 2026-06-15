"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders text where each word is individually tappable. Tapping a word calls
 * `onWord` with the cleaned headword (punctuation stripped), which drives the
 * "add this word to my vocabulary" flow. Non-word tokens (spaces, punctuation)
 * render as-is and aren't interactive.
 */

// A token is either a tappable word or inert filler (spaces/punctuation).
const TOKEN_RE = /[\p{L}][\p{L}\p{M}'’-]*|[^\p{L}]+/gu;

/** Strip surrounding/dangling punctuation, keeping internal hyphen/apostrophe. */
function cleanWord(token: string): string {
  return token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "").replace(/[’]/g, "'");
}

interface Props {
  text: string;
  onWord: (word: string) => void;
  /** Words already saved, highlighted so the reader can see their progress. */
  savedWords?: Set<string>;
  className?: string;
}

export function TappableText({ text, onWord, savedWords, className }: Props) {
  const tokens = useMemo(() => text.match(TOKEN_RE) ?? [], [text]);

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        const word = cleanWord(token);
        // Only single alphabetic words (2+ letters) are worth looking up.
        if (word.length < 2 || /[^\p{L}'-]/u.test(word)) {
          return <span key={i}>{token}</span>;
        }
        const saved = savedWords?.has(word.toLowerCase());
        return (
          <button
            key={i}
            type="button"
            onClick={() => onWord(word)}
            className={cn(
              "rounded-sm transition-colors hover:bg-brand/15 hover:text-foreground focus-visible:bg-brand/15 focus-visible:outline-none",
              saved && "bg-brand/10 text-brand decoration-brand/40 underline underline-offset-2",
            )}
          >
            {token}
          </button>
        );
      })}
    </span>
  );
}
