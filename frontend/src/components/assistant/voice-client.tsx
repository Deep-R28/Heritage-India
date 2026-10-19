"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useSpeechToText, useTextToSpeech } from "@/hooks/use-speech";
import { languages, type LanguageCode } from "@/i18n/config";
import { sendMessageToAssistant } from "@/lib/assistant";
import { FormattedMessage } from "@/components/assistant/formatted-message";

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // strip markdown links, keep label
    .replace(/https?:\/\/\S+/g, "") // strip raw URLs
    .replace(/\/checkout\S*/g, "") // strip relative checkout paths
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^[-•*]\s*/gm, "")
    .replace(/₹/g, "Rupees ")
    .replace(/\(([^)]+)\)/g, ", $1,")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

export function VoiceClient() {
  const { t, i18n } = useTranslation();
  const phrases = t("assistant.voice.phrases", { returnObjects: true }) as string[];
  const currentLanguage = (i18n.language?.slice(0, 2) as LanguageCode) ?? "en";
  const router = useRouter();

  const bcp47Map: Record<string, string> = {
    hi: "hi-IN",
    bn: "bn-IN",
    ta: "ta-IN",
    te: "te-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    pa: "pa-IN",
    ur: "ur-IN",
    es: "es-ES",
    en: "en-IN",
  };
  const langCode = bcp47Map[currentLanguage] || "en-IN";
  const { isListening, transcript, micLevel, error, start, stop, setTranscript } = useSpeechToText(langCode);
  const { isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech(langCode);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isBusyRef = useRef(false);
  const lastQueryRef = useRef("");

  useEffect(() => {
    start();
    return () => {
      stop();
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When speech pauses, send transcript to assistant
  useEffect(() => {
    // If currently processing or speaking aloud, ignore any audio
    if (processing || isSpeaking || isBusyRef.current) return;
    const query = transcript.trim();
    if (!query || query === lastQueryRef.current) return;

    // Check if user is voice-commanding to go to payment
    const lowerQuery = query.toLowerCase();
    if (
      (lowerQuery.includes("pay") || lowerQuery.includes("payment") || lowerQuery.includes("checkout")) &&
      assistantReply &&
      assistantReply.includes("/checkout")
    ) {
      const match = assistantReply.match(/\/checkout\S+/);
      if (match) {
        stop();
        stopSpeaking();
        const cleanUrl = match[0].replace(/[)\]]+$/, "");
        router.push(cleanUrl);
        return;
      }
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (isBusyRef.current) return;
      isBusyRef.current = true;
      setProcessing(true);
      lastQueryRef.current = query;

      // 1. STOP listening immediately so microphone won't pick up speaker output
      stop();

      try {
        const reply = await sendMessageToAssistant(query, undefined, undefined, currentLanguage);
        setAssistantReply(reply.text);
        setTranscript("");

        if (typeof window !== "undefined" && reply.text) {
          try {
            const linkMatch =
              reply.text.match(/\[[^\]]*\]\(((?:[^()]+|\([^()]*\))*\/checkout\?[^\s)]*)\)/i) ||
              reply.text.match(/(?:href=["']|\()([^"')\s]*\/checkout\?[^\s"'>)]+)/i);
            if (linkMatch && linkMatch[1]) {
              const rawUrl = linkMatch[1].replace(/&amp;/g, "&");
              const urlObj = new URL(rawUrl, window.location.origin);
              const site = urlObj.searchParams.get("site") || urlObj.searchParams.get("monument") || urlObj.searchParams.get("place") || urlObj.searchParams.get("siteSlug");
              const party = urlObj.searchParams.get("partySize") || urlObj.searchParams.get("members") || urlObj.searchParams.get("visitors") || urlObj.searchParams.get("tickets");
              const date = urlObj.searchParams.get("date") || urlObj.searchParams.get("visitDate");
              const slot = urlObj.searchParams.get("slot") || urlObj.searchParams.get("time") || urlObj.searchParams.get("visitSlot");
              const guideName = urlObj.searchParams.get("guide") || urlObj.searchParams.get("guideName");
              const guideId = urlObj.searchParams.get("guideId");

              if (site) {
                localStorage.setItem(
                  "heritage_last_chat_booking",
                  JSON.stringify({
                    siteSlug: site,
                    partySize: party ? parseInt(party, 10) : undefined,
                    visitDate: date,
                    visitSlot: slot,
                    guideName: guideName || guideId || undefined,
                    guideId: guideId || guideName || undefined,
                  })
                );
              }
            }
          } catch {}
        }

        // 2. Speak reply and wait for audio to fully finish
        await speak(cleanTextForSpeech(reply.text), langCode);

        // 3. Grace cooldown (800ms) for room echo to dissipate
        await new Promise((r) => setTimeout(r, 800));
        setTranscript("");
      } catch (err) {
        console.error("Voice assistant query error:", err);
      } finally {
        setProcessing(false);
        isBusyRef.current = false;
        // 4. Resume listening for user's next voice input
        start();
      }
    }, 1800); // 1.8s silence triggers query

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, processing, isSpeaking, start, stop, setTranscript, speak, langCode, t]);

  useEffect(() => {
    if (transcript || assistantReply) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [phrases.length, transcript, assistantReply]);

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
          onClick={() => {
            stop();
            stopSpeaking();
            router.push("/assistant");
          }}
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
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : isSpeaking ? (
              <span className="text-accent animate-pulse">Assistant Speaking...</span>
            ) : processing ? (
              <span className="text-accent animate-pulse">Consulting Heritage Intelligence...</span>
            ) : isListening ? (
              t("assistant.voice.listening")
            ) : (
              t("assistant.voice.muted")
            )}
          </p>
        </div>

        {/* Live Audio Reactive Orb */}
        <div
          className={cn(
            "relative flex items-center justify-center transition-all duration-300",
            assistantReply ? "mb-6 h-28 w-28 md:h-36 md:w-36" : "mb-12 h-44 w-44 md:h-56 md:w-56"
          )}
        >
          <div
            className="absolute inset-0 rounded-full border border-accent/20 transition-transform duration-100"
            style={{
              transform: `scale(${1 + micLevel * 0.4})`,
            }}
          />
          <div
            className="absolute inset-4 rounded-full border border-accent/40 transition-transform duration-100"
            style={{
              transform: `scale(${1 + micLevel * 0.3})`,
            }}
          />
          <div
            className={cn(
              "flex items-center justify-center rounded-full border border-accent/50 bg-gradient-to-tr from-accent/20 to-accent shadow-[0_0_50px_rgba(201,162,75,0.3)] backdrop-blur-sm transition-all duration-100",
              assistantReply ? "h-20 w-20 md:h-24 md:w-24" : "h-32 w-32 md:h-40 md:w-40"
            )}
            style={{
              transform: `scale(${1 + micLevel * 0.2})`,
            }}
          >
            <Icon
              name={isSpeaking ? "volume_up" : "graphic_eq"}
              filled
              className={cn("text-background transition-all", assistantReply ? "text-3xl md:text-4xl" : "text-5xl md:text-6xl", isSpeaking && "animate-pulse")}
            />
          </div>
        </div>

        {/* Transcript or Assistant Response */}
        <div className="w-full max-w-2xl px-4 text-center">
          {transcript ? (
            <p className="font-headline text-xl font-light leading-relaxed text-accent animate-pulse md:text-2xl">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : assistantReply ? (
            <div className="mx-auto max-h-64 w-full overflow-y-auto rounded-2xl border border-hairline bg-surface/90 p-5 text-left shadow-2xl backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between border-b border-hairline pb-2">
                <span className="flex items-center gap-2 font-label text-xs uppercase tracking-widest text-accent">
                  <Icon name="auto_awesome" className="text-sm" />
                  Heritage Concierge
                </span>
                <span className="font-label text-xs text-foreground-muted">
                  {isSpeaking ? "Speaking aloud…" : "Tap mic below to ask follow-up"}
                </span>
              </div>
              <FormattedMessage text={assistantReply} />
            </div>
          ) : (
            <p className="font-headline text-xl font-light leading-relaxed text-foreground transition-opacity duration-300 md:text-3xl">
              <span className={visible ? "opacity-100" : "opacity-0"}>
                &ldquo;{phrases[phraseIndex]}&rdquo;
              </span>
            </p>
          )}
        </div>

        <span className="mt-4 rounded-full border border-hairline px-4 py-1.5 font-label text-xs uppercase tracking-widest text-foreground-muted">
          {t("assistant.voice.autoDetected", { language: languages[currentLanguage].label })}
        </span>
      </main>

      {/* Bottom control bar */}
      <div className="absolute bottom-0 left-0 z-20 w-full bg-gradient-to-t from-background to-transparent px-4 pb-8 pt-4">
        <div className="glass-panel mx-auto flex max-w-2xl items-center justify-between rounded-full px-6 py-4 shadow-2xl md:px-12">
          <button
            aria-label="Mute microphone"
            onClick={() => {
              if (isListening) {
                stop();
              } else {
                start();
              }
            }}
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
            onClick={() => {
              stop();
              stopSpeaking();
              router.push("/assistant");
            }}
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
