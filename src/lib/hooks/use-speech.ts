"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Speak English words aloud with the browser's built-in Web Speech API
 * (`speechSynthesis`). Uses on-device OS voices, so it's free, needs no API
 * key, and works fully offline — in keeping with Lexio's offline-first design.
 *
 * Voices load asynchronously in most browsers, so we track them and prefer a
 * natural en-US / en-GB voice when one is available.
 */
export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
      voiceRef.current =
        english.find((v) => /en[-_]us/i.test(v.lang)) ??
        english.find((v) => /en[-_]gb/i.test(v.lang)) ??
        english[0] ??
        voices[0];
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      // Interrupt anything already playing so rapid taps don't queue up.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = voiceRef.current?.lang ?? "en-US";
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  return { speak, speaking, supported };
}
