"use client";

import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { parseEpub } from "@/lib/epub/parse";
import { repository } from "@/lib/db/dexie-repository";
import { useT } from "@/lib/i18n";

/**
 * Adds a book from the device: a hidden file input feeds the chosen EPUB to the
 * client-side {@link parseEpub} (no upload — everything stays on-device), then
 * stores it via the repository. The live library list updates automatically.
 */
export function AddBookButton({ className }: { className?: string }) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const toastId = toast.loading(
      t.library.importing.replace("{name}", file.name),
    );
    try {
      const parsed = parseEpub(await file.arrayBuffer());
      const book = await repository.books.create({
        title: parsed.title,
        author: parsed.author,
        language: parsed.language,
        cover: parsed.cover,
        fileName: file.name,
        fileSize: file.size,
        chapters: parsed.chapters,
        resources: parsed.resources,
      });
      toast.success(t.library.importedToast.replace("{title}", book.title), {
        id: toastId,
      });
    } catch (err) {
      console.error("[AddBook] Failed to import EPUB:", err);
      toast.error(t.library.importError, { id: toastId });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".epub,application/epub+zip"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button
        className={className}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        {busy ? t.library.adding : t.library.addBook}
      </Button>
    </>
  );
}
