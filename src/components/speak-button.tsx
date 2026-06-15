"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSpeech } from "@/lib/hooks/use-speech";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  /** The text to pronounce (the English word or phrase). */
  text: string;
  className?: string;
  size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg";
  variant?: "ghost" | "outline" | "secondary";
}

/**
 * A speaker button that reads a word aloud via the Web Speech API. Renders
 * nothing when the browser can't synthesize speech, so callers don't need to
 * guard for support themselves.
 */
export function SpeakButton({
  text,
  className,
  size = "icon-sm",
  variant = "ghost",
}: SpeakButtonProps) {
  const t = useT();
  const { speak, speaking, supported } = useSpeech();

  if (!supported) return null;

  const label = t.speak.listen.replace("{word}", text);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size={size}
            aria-label={label}
            className={cn("text-muted-foreground hover:text-foreground", className)}
            onClick={(e) => {
              // Don't trigger card flips or parent click handlers.
              e.stopPropagation();
              speak(text);
            }}
          />
        }
      >
        <Volume2 className={cn("size-4", speaking && "text-brand animate-pulse")} />
      </TooltipTrigger>
      <TooltipContent>{t.speak.tooltip}</TooltipContent>
    </Tooltip>
  );
}
