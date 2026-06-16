"use client";

import { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useChat } from "@/lib/hooks/use-chat";
import { useT } from "@/lib/i18n";
import { AssistantPanel } from "./assistant-panel";

/**
 * Floating launcher present on every in-app page. Owns the (ephemeral) chat
 * state so the conversation survives opening/closing the sheet within a session.
 */
export function AssistantFab() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const chat = useChat();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            size="icon-lg"
            aria-label={t.assistant.fab}
            // Sits above the mobile bottom nav; bottom-right on desktop.
            className="fixed right-4 bottom-20 z-40 size-12 rounded-full shadow-lg md:bottom-6"
          />
        }
      >
        <MessageCircle className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="flex-row items-start justify-between border-b">
          <div className="flex flex-col gap-0.5">
            <SheetTitle>{t.assistant.title}</SheetTitle>
            <SheetDescription>{t.assistant.subtitle}</SheetDescription>
          </div>
          {chat.messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={chat.reset}
              aria-label={t.assistant.clear}
              className="mr-8"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </SheetHeader>
        <AssistantPanel chat={chat} />
      </SheetContent>
    </Sheet>
  );
}
