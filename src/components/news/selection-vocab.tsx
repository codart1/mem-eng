"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Watches for a multi-word text selection (an idiom or phrase the reader wants
 * to learn) and shows a small floating "Add" button near it. Clicking the
 * button hands the phrase to the same word-add flow as a single tap. Single
 * words are handled by TappableText's click; this only covers 2+ word phrases.
 */

const MIN_WORDS = 2;
const MAX_WORDS = 8;
const MAX_CHARS = 60;
// Letters, spaces, and intra-word punctuation only — skip selections that span
// UI chrome, numbers, or markup.
const PHRASE_RE = /^[\p{L}][\p{L}\s'’-]*[\p{L}]$/u;

interface Anchor {
  text: string;
  x: number;
  y: number;
}

export function SelectionVocab({ onSelect }: { onSelect: (phrase: string) => void }) {
  const t = useT();
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  useEffect(() => {
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setAnchor(null);
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
        setAnchor(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setAnchor(null);
        return;
      }
      setAnchor({ text, x: rect.left + rect.width / 2, y: rect.top });
    };

    const clear = () => setAnchor(null);
    // Compute on pointer/selection release; clear on scroll so it doesn't drift.
    document.addEventListener("mouseup", update);
    document.addEventListener("touchend", update);
    document.addEventListener("selectionchange", update);
    document.addEventListener("scroll", clear, true);
    window.addEventListener("resize", clear);
    return () => {
      document.removeEventListener("mouseup", update);
      document.removeEventListener("touchend", update);
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
    };
  }, []);

  if (!anchor || typeof document === "undefined") return null;

  return createPortal(
    <button
      type="button"
      // Keep the text selection from collapsing when the button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        onSelect(anchor.text);
        window.getSelection()?.removeAllRanges();
        setAnchor(null);
      }}
      style={{
        position: "fixed",
        left: anchor.x,
        top: anchor.y - 8,
        transform: "translate(-50%, -100%)",
        zIndex: 60,
      }}
      className="bg-brand text-brand-foreground flex max-w-[16rem] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105"
    >
      <Plus className="size-3.5 shrink-0" />
      <span className="truncate">
        {t.news.addPhrase.replace("{text}", anchor.text)}
      </span>
    </button>,
    document.body,
  );
}
