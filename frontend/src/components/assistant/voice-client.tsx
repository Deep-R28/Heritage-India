"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useSpeechToText } from "@/hooks/use-speech";
import { languages, type LanguageCode } from "@/i18n/config";

export function VoiceClient() {
  const { t, i18n } = useTranslation();
  const phrases = t("assistant.voice.phrases", { returnObjects: true }) as string[];
  const currentLanguage = (i18n.language?.slice(0, 2) as LanguageCode) ?? "en";
  const router = useRouter();
  const { isListening, start, stop } = useSpeechToText();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
      <style>{`
        @keyframes voice-pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.08); opacity: 1; } }
      `}</style>
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background via-surface/30 to-background" />

      {/* Minimal top: logo only, way out */}
      <div className="relative z-10 flex items-center justify-between p-8">
        <Link href="/" className="font-headline text-2xl font-bold text-accent">
          Heritage India
        </Link>
        <button
          onClick={() => router.push("/assistant")}
          aria-label="Exit voice mode"
          className="text-foreground-muted transition-colors hover:text-accent"
        >
          <Icon name="close" />
        </button>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-grow flex-col items-center justify-center px-4 pb-24">
        <div className="absolute top-8 left-0 right-0 mx-auto max-w-md text-center">
          <h1 className="font-headline text-2xl uppercase tracking-widest text-accent opacity-80">
            {t("assistant.voice.title")}
          </h1>
          <p className="mt-2 font-body text-sm text-foreground-muted opacity-60">
            {isListening ? t("assistant.voice.listening") : t("assistant.voice.muted")}
          </p>
        </div>

        {/* Orb */}
        <div className="relative mb-16 flex h-48 w-48 items-center justify-center md:h-64 md:w-64">
          <div
            className="absolute inset-0 rounded-full border border-accent/20"
            style={{ animation: "voice-pulse 3s ease-in-out infinite", animationDelay: "-1s" }}
          />
          <div
            className="absolute inset-4 rounded-full border border-accent/40"
            style={{ animation: "voice-pulse 3s ease-in-out infinite", animationDelay: "-0.5s" }}
          />
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full border border-accent/50 bg-gradient-to-tr from-accent/20 to-accent shadow-[0_0_50px_rgba(201,162,75,0.3)] backdrop-blur-sm md:h-40 md:w-40"
            style={{ animation: "voice-pulse 3s ease-in-out infinite" }}
          >
            <Icon name="graphic_eq" filled className="text-5xl text-background md:text-6xl" />
          </div>
        </div>

        <div className="min-h-[80px] w-full px-4 text-center">
          <p
            className={cn(
              "font-headline text-2xl font-light leading-relaxed text-foreground transition-opacity duration-500 md:text-4xl",
              visible ? "opacity-100" : "opacity-0",
            )}
          >
            &ldquo;{phrases[phraseIndex]}&rdquo;
          </p>
        </div>

        <span className="mt-6 rounded-full border border-hairline px-4 py-1.5 font-label text-xs uppercase tracking-widest text-foreground-muted">
          {t("assistant.voice.autoDetected", { language: languages[currentLanguage].label })}
        </span>
      </main>

      {/* Bottom control bar */}
      <div className="absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-background to-transparent px-4 pb-8 pt-4">
        <div className="glass-panel mx-auto flex max-w-2xl items-center justify-between rounded-full px-6 py-4 shadow-2xl md:px-12">
          <button
            aria-label="Mute microphone"
            onClick={() => (isListening ? stop() : start())}
            className="group flex w-16 flex-col items-center justify-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline text-foreground transition-colors group-hover:bg-surface-hover">
              <Icon name={isListening ? "mic" : "mic_off"} className="text-2xl" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-foreground-muted transition-colors group-hover:text-accent">
              {isListening ? t("assistant.voice.mute") : t("assistant.voice.unmute")}
            </span>
          </button>

          <button
            aria-label="End session"
            onClick={() => router.push("/assistant")}
            className="group -mt-8 flex flex-col items-center justify-center gap-1"
          >
            <div className="flex h-16 w-16 transform items-center justify-center rounded-full border border-error/30 bg-error/10 text-error shadow-[0_0_20px_rgba(211,47,47,0.15)] transition-all group-hover:scale-105 group-hover:bg-error/20">
              <Icon name="call_end" filled className="text-3xl" />
            </div>
            <span className="mt-2 text-[10px] uppercase tracking-widest text-error">{t("assistant.voice.end")}</span>
          </button>

          <Link
            href="/assistant/chat"
            aria-label="Switch to text mode"
            className="group flex w-16 flex-col items-center justify-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline text-foreground transition-colors group-hover:bg-surface-hover">
              <Icon name="keyboard" className="text-2xl" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-foreground-muted transition-colors group-hover:text-accent">
              {t("assistant.voice.text")}
            </span>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/assistant/chat"
            className="inline-flex items-center gap-2 border-b border-transparent pb-1 font-label text-xs uppercase tracking-[0.1em] text-foreground-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon name="chat" className="text-[16px]" />
            {t("assistant.voice.switchToChat")}
          </Link>
        </div>
      </div>
    </div>
  );
}
