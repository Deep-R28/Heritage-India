"use client";

/**
 * Speech hooks using the browser Web Speech API (SpeechRecognition + SpeechSynthesis)
 * and Web Audio AnalyserNode for mic amplitude.
 */
import { useCallback, useEffect, useRef, useState } from "react";

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{ [index: number]: { transcript: string }; length: number }>;
}

interface ISpeechRecognitionErrorEvent {
  error: string;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as SpeechRecognitionCtor | undefined;
}

function getAudioContextCtor(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (window.AudioContext || w.webkitAudioContext) as typeof AudioContext | undefined;
}

export function useSpeechToText(lang = "en-IN") {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const SpeechRec = getSpeechRecognitionCtor();
    if (!SpeechRec) {
      setIsSupported(false);
    }
  }, []);

  const startAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioCtx = getAudioContextCtor();
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(1, avg / 128));
        animFrameRef.current = requestAnimationFrame(checkLevel);
      };
      checkLevel();
    } catch (err: unknown) {
      console.warn("Could not start audio analyser:", err);
      setError("Microphone permission denied");
    }
  };

  const stopAudioAnalyser = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    setMicLevel(0);
  };

  const start = useCallback(() => {
    setError(null);
    const SpeechRec = getSpeechRecognitionCtor();
    if (!SpeechRec) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        startAudioAnalyser();
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            currentTranscript += item[0].transcript;
          }
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please grant permission.");
        }
        setIsListening(false);
        stopAudioAnalyser();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioAnalyser();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start speech recognition";
      setError(msg);
      setIsListening(false);
    }
  }, [lang]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    stopAudioAnalyser();
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    micLevel,
    isSupported,
    error,
    start,
    stop,
    setTranscript,
    resetTranscript,
  };
}

export function useTextToSpeech(defaultLang = "en-IN") {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setIsSupported(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, lang = defaultLang): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };

        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        window.speechSynthesis.speak(utterance);
      });
    },
    [defaultLang],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
  };
}
