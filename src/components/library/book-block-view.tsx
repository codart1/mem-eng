"use client";

import { TappableText } from "@/components/vocab/tappable-text";
import type { ContentBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Renders one {@link ContentBlock} of a book. Mirrors the news reader's
 * BlockView, but image blocks resolve their in-archive `src` to an object URL
 * via `resourceUrls` (created by the reader from the stored image blobs).
 */
export function BookBlockView({
  block,
  onWord,
  savedWords,
  resourceUrls,
}: {
  block: ContentBlock;
  onWord: (word: string) => void;
  savedWords: Set<string>;
  resourceUrls: Record<string, string>;
}) {
  const tap = (text: string, className?: string) => (
    <TappableText
      text={text}
      onWord={onWord}
      savedWords={savedWords}
      className={className}
    />
  );

  switch (block.type) {
    case "heading":
      return (
        <h2
          className={cn(
            "font-serif font-semibold tracking-tight",
            block.level === 2 ? "mt-2 text-2xl" : "text-xl",
          )}
        >
          {tap(block.text)}
        </h2>
      );
    case "paragraph":
      return <p>{tap(block.text)}</p>;
    case "quote":
      return (
        <blockquote className="border-brand border-l-2 pl-4 italic opacity-90">
          {tap(block.text)}
        </blockquote>
      );
    case "list":
      return (
        <ul
          className={cn(
            "ml-5 space-y-1.5",
            block.ordered ? "list-decimal" : "list-disc",
          )}
        >
          {block.items.map((item, i) => (
            <li key={i}>{tap(item)}</li>
          ))}
        </ul>
      );
    case "image": {
      const src = resourceUrls[block.src];
      if (!src) return null;
      return (
        <figure className="space-y-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={block.alt ?? ""}
            loading="lazy"
            className="mx-auto max-h-[80vh] rounded-lg"
          />
          {block.caption && (
            <figcaption className="text-center text-xs opacity-70">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }
  }
}
