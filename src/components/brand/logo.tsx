import { cn } from "@/lib/utils";

/**
 * The Lexio mark: an open book whose spine releases a spark — vocabulary
 * (the book) turning into lasting memory and AI-built insight (the spark).
 *
 * Drawn in pure `currentColor` so it adapts to any context: white on the brand
 * tile in the app shell, brand-colored on its own, light or dark. The book's
 * two pages are separate shapes with a small center gap, so the spine reads
 * clearly on any background without needing a contrasting stroke.
 *
 * The same silhouette is rasterized into the PWA icons from `public/icon.svg`.
 */
export function LexioGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-5", className)}
    >
      {/* spark above the spine */}
      <path d="M12 1.2c.25 1.8 1 2.55 2.8 2.8-1.8.25-2.55 1-2.8 2.8-.25-1.8-1-2.55-2.8-2.8 1.8-.25 2.55-1 2.8-2.8Z" />
      {/* left page */}
      <path d="M11 8.5C8.6 7.1 5.6 6.7 3.3 7.0 2.8 7.06 2.5 7.4 2.5 7.85L2.5 16.4c0 .45.36.8.8.75 2.3-.25 5.3.15 7.7 1.55Z" />
      {/* right page */}
      <path d="M13 8.5c2.4-1.4 5.4-1.8 7.7-1.5.5.06.8.4.8.85L21.5 16.4c0 .45-.36.8-.8.75-2.3-.25-5.3.15-7.7 1.55Z" />
    </svg>
  );
}

interface LexioMarkProps {
  /** Tailwind size class for the rounded brand tile, e.g. "size-9". */
  className?: string;
  /** Tailwind size class for the glyph inside the tile. */
  glyphClassName?: string;
}

/** The mark on its brand-colored rounded tile, as used in the app header. */
export function LexioMark({ className, glyphClassName }: LexioMarkProps) {
  return (
    <span
      className={cn(
        "bg-brand text-brand-foreground grid size-9 place-items-center rounded-xl shadow-sm",
        className,
      )}
    >
      <LexioGlyph className={cn("size-5", glyphClassName)} />
    </span>
  );
}
