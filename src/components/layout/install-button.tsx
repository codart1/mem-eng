"use client";

import { useState, type ReactNode } from "react";
import { Download, Share } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePwaInstall } from "@/lib/hooks/use-pwa-install";
import { useT } from "@/lib/i18n";

type Props = {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

/**
 * "Install app" button. On Chromium it fires the native install prompt; on iOS
 * Safari (which has no prompt) it opens a short "Add to Home Screen" guide.
 * Renders nothing when the app is already installed or the browser offers no
 * install path, so it can be dropped anywhere safely.
 */
export function InstallButton({ className, variant = "outline", size }: Props) {
  const t = useT();
  const { canInstall, isStandalone, isIOS, promptInstall } = usePwaInstall();
  const [iosOpen, setIosOpen] = useState(false);

  if (isStandalone) return null;
  if (!canInstall && !isIOS) return null;

  async function handleClick() {
    if (canInstall) {
      const outcome = await promptInstall();
      if (outcome === "accepted") toast.success(t.install.installedToast);
    } else {
      setIosOpen(true);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
      >
        <Download className="size-4" />
        {t.install.button}
      </Button>

      <Sheet open={iosOpen} onOpenChange={setIosOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto gap-0 sm:max-w-md sm:rounded-t-xl"
        >
          <SheetHeader>
            <SheetTitle>{t.install.iosTitle}</SheetTitle>
            <SheetDescription>{t.install.iosIntro}</SheetDescription>
          </SheetHeader>
          <ol className="space-y-3 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] text-sm">
            <Step n={1} icon={<Share className="size-4" />}>
              {t.install.iosStep1}
            </Step>
            <Step n={2}>{t.install.iosStep2}</Step>
            <Step n={3}>{t.install.iosStep3}</Step>
          </ol>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Step({
  n,
  icon,
  children,
}: {
  n: number;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="bg-brand/10 text-brand grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold">
        {n}
      </span>
      <span className="flex items-center gap-1.5">
        {children}
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </span>
    </li>
  );
}
