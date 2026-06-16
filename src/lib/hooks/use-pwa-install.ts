"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The (non-standard, Chromium-only) install prompt event. Captured before
 * hydration by the inline script in `layout.tsx` and stashed on
 * `window.__lexioBIP`, because the browser may fire it before React mounts.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallWindow = Window & {
  __lexioBIP?: BeforeInstallPromptEvent | null;
  navigator: Navigator & { standalone?: boolean };
};

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

export interface PwaInstall {
  /** A native install prompt is available (Chromium/Android/desktop Chrome). */
  canInstall: boolean;
  /** The app is already installed / running in standalone mode. */
  isStandalone: boolean;
  /** iOS Safari, which has no install prompt — needs manual instructions. */
  isIOS: boolean;
  /** Fire the native prompt. Resolves with the user's choice. */
  promptInstall: () => Promise<InstallOutcome>;
}

function isStandaloneNow(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as InstallWindow["navigator"]).standalone === true
  );
}

export function usePwaInstall(): PwaInstall {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const win = window as InstallWindow;
    setIsStandalone(isStandaloneNow());

    const ua = navigator.userAgent || "";
    // iPadOS 13+ reports as desktop Safari, so also treat touch-Macs as iOS.
    const iOSLike =
      /iphone|ipad|ipod/i.test(ua) ||
      (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    setIsIOS(iOSLike && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua));

    // Pick up an event the pre-hydration script may have already captured.
    if (win.__lexioBIP) setDeferred(win.__lexioBIP);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    // The capture script re-dispatches this once it stashes the event.
    const onCaptured = () => {
      if (win.__lexioBIP) setDeferred(win.__lexioBIP);
    };
    const onInstalled = () => {
      win.__lexioBIP = null;
      setDeferred(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("lexio-bip", onCaptured);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("lexio-bip", onCaptured);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    // A prompt can only be used once.
    (window as InstallWindow).__lexioBIP = null;
    setDeferred(null);
    return outcome;
  }, [deferred]);

  return { canInstall: deferred !== null, isStandalone, isIOS, promptInstall };
}
