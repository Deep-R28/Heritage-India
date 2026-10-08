"use client";

/**
 * Voice stub hooks (MAKE.md Section 11). UI-complete, logic-empty — swap
 * these bodies for the Web Speech API or a real STT/TTS provider later.
 */
import { useCallback, useState } from "react";

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const start = useCallback(() => setIsListening(true), []);
  const stop = useCallback(() => setIsListening(false), []);

  return { isListening, transcript, start, stop, setTranscript };
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string) => {
    setIsSpeaking(true);
    // Stub: a real TTS call would speak `text` aloud here.
    await new Promise((resolve) => setTimeout(resolve, Math.min(600 + text.length * 20, 3000)));
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak };
}
