"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { deckColor } from "@/lib/deck-color";
import type { VocabCard } from "@/lib/types";

interface FlashcardProps {
  card: VocabCard;
  revealed: boolean;
  onReveal: () => void;
  deckColorKey?: string;
}

export function Flashcard({
  card,
  revealed,
  onReveal,
  deckColorKey,
}: FlashcardProps) {
  const accent = deckColor(deckColorKey);

  return (
    <div className="perspective-1000 w-full">
      <div
        className={cn(
          "transform-style-3d relative min-h-[clamp(360px,52vh,520px)] w-full transition-transform duration-500",
          revealed && "rotate-y-180",
        )}
      >
        {/* Front */}
        <button
          type="button"
          onClick={onReveal}
          aria-label="Reveal definition"
          className={cn(
            "backface-hidden bg-card absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border p-8 text-center shadow-sm transition-shadow hover:shadow-md",
          )}
          style={{ borderTopWidth: 4, borderTopColor: accent }}
        >
          {card.cefr && (
            <Badge variant="secondary" className="absolute top-5 right-5">
              {card.cefr}
            </Badge>
          )}
          <h2 className="font-serif text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            {card.word}
          </h2>
          {card.phonetic && (
            <p className="text-muted-foreground font-mono text-lg">
              {card.phonetic}
            </p>
          )}
          {card.partOfSpeech && (
            <p className="text-muted-foreground text-sm italic">
              {card.partOfSpeech}
            </p>
          )}
          <p className="text-muted-foreground/70 absolute bottom-6 text-xs">
            Tap or press Space to reveal
          </p>
        </button>

        {/* Back */}
        <div
          className={cn(
            "backface-hidden rotate-y-180 bg-card absolute inset-0 flex flex-col overflow-hidden rounded-3xl border shadow-sm",
          )}
          style={{ borderTopWidth: 4, borderTopColor: accent }}
        >
          <div className="flex items-baseline gap-2 border-b px-6 py-4">
            <span className="font-serif text-2xl font-semibold">{card.word}</span>
            {card.phonetic && (
              <span className="text-muted-foreground font-mono text-sm">
                {card.phonetic}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div>
              {card.partOfSpeech && (
                <span className="text-muted-foreground text-xs italic">
                  {card.partOfSpeech}
                </span>
              )}
              <p className="text-lg leading-relaxed">{card.definition}</p>
            </div>

            {card.examples.length > 0 && (
              <div className="space-y-1.5">
                {card.examples.map((ex, i) => (
                  <p
                    key={i}
                    className="text-muted-foreground border-l-2 pl-3 text-sm italic"
                    style={{ borderColor: accent }}
                  >
                    “{ex}”
                  </p>
                ))}
              </div>
            )}

            {(card.synonyms.length > 0 || card.antonyms.length > 0) && (
              <div className="flex flex-wrap gap-4 text-sm">
                {card.synonyms.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Synonyms</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {card.synonyms.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {card.antonyms.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Antonyms</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {card.antonyms.map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {card.mnemonic && (
              <div className="bg-amber/10 text-amber-foreground dark:text-foreground rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">💡 </span>
                {card.mnemonic}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
