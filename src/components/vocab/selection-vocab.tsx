"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Watches for a multi-word text selection (an idiom or phrase the reader wants
 * to learn) and surfaces an "Add" pill pinned to the bottom of the screen.
 * Clicking it hands the phrase to the same word-add flow as a single tap.
 *
 * The pill sits at the bottom rather than floating beside the selection so it
 * never fights the OS's own selection toolbar (Copy / Share / …), which paints
 * directly over the selection on touch devices. Single words are handled by
 * TappableText's click; this only covers 2+ word phrases.
 */

const MIN_WORDS = 2;
const MAX_WORDS = 8;
const MAX_CHARS = 60;
// Letters, spaces, and intra-word punctuation only — skip selections that span
// UI chrome, numbers, or markup.
const PHRASE_RE = /^[\p{L}][\p{L}\s'’-]*[\p{L}]$/u;

export function SelectionVocab({ onSelect }: { onSelect: (phrase: string) => void }) {
  const t = useT();
  const [phrase, setPhrase] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPhrase(null);
        return;
      }
      const text = sel.toString().replace(/\s+/g, " ").trim();
      const words = text ? text.split(" ") : [];
      if (
        words.length < MIN_WORDS ||
        words.length > MAX_WORDS ||
        text.length > MAX_CHARS ||
        !PHRASE_RE.test(text)
      ) {
        setPhrase(null);
        return;
      }
      setPhrase(text);
    };

    document.addEventListener("mouseup", update);
    document.addEventListener("touchend", update);
    document.addEventListener("selectionchange", update);
    return () => {
      document.removeEventListener("mouseup", update);
      document.removeEventListener("touchend", update);
      document.removeEventListener("selectionchange", update);
    };
  }, []);

  if (!phrase || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      // Clear the mobile bottom nav (~3.5rem) plus the safe-area inset.
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)" }}
    >
      <button
        type="button"
        // Keep the text selection from collapsing when the pill is pressed.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onSelect(phrase);
          window.getSelection()?.removeAllRanges();
          setPhrase(null);
        }}
        className="bg-brand text-brand-foreground pointer-events-auto flex max-w-[20rem] items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="size-4 shrink-0" />
        <span className="truncate">
          {t.vocab.addPhrase.replace("{text}", phrase)}
        </span>
      </button>
    </div>,
    document.body,
  );
}
