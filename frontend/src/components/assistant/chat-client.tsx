"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { sendMessageToAssistant, type AssistantMessage } from "@/lib/assistant";
import { languages, type LanguageCode } from "@/i18n/config";

export function ChatClient() {
  const { t, i18n } = useTranslation();
  const suggestedPrompts = t("assistant.chat.suggestions", { returnObjects: true }) as string[];
  const currentLanguage = (i18n.language?.slice(0, 2) as LanguageCode) ?? "en";
  const initialMessages = useMemo<AssistantMessage[]>(
    () => [{ id: "seed-1", role: "assistant", text: t("assistant.chat.seed") }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: trimmed }]);
    setInput("");
    setSending(true);
    const reply = await sendMessageToAssistant(trimmed, (input) => t("assistant.chat.stubResponse", { input }));
    setMessages((m) => [...m, reply]);
    setSending(false);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col md:flex-row">
      {/* Left: atmospheric copy, desktop only */}
      <div className="relative hidden w-1/2 flex-col justify-end overflow-hidden bg-surface p-12 md:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface" />
        <div className="relative z-10">
          <h1 className="mb-4 font-headline text-4xl font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
            {t("assistant.chat.leftTitleLine1")}
            <br />
            <span className="font-bold italic text-accent">{t("assistant.chat.leftTitleLine2")}</span>
          </h1>
          <p className="max-w-md font-body text-lg text-foreground-muted">
            {t("assistant.chat.leftBody")}
          </p>
        </div>
      </div>

      {/* Right: chat panel */}
      <div className="relative z-10 flex h-full w-full flex-col border-l border-hairline bg-surface/90 backdrop-blur-xl md:w-1/2">
        <div className="flex items-center justify-between border-b border-hairline bg-surface/60 px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <Icon name="auto_awesome" filled className="text-accent" />
            <h2 className="font-headline text-xl tracking-wide text-foreground">{t("assistant.chat.header")}</h2>
          </div>
          <Link
            href="/assistant/voice"
            className="flex items-center gap-2 font-label text-xs uppercase tracking-widest text-accent hover:opacity-80"
          >
            <Icon name="mic" className="text-sm" />
            {t("assistant.chat.voiceModeLink")}
          </Link>
        </div>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex w-5/6 items-start", msg.role === "user" && "w-5/6 self-end justify-end")}
            >
              {msg.role === "assistant" && (
                <div className="mr-4 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-hover">
                  <Icon name="auto_awesome" className="text-sm text-accent" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-xl p-5 font-body leading-relaxed",
                  msg.role === "assistant"
                    ? "glass-panel rounded-tl-none text-foreground"
                    : "rounded-tr-none border border-accent/30 bg-accent/10 text-accent",
                )}
              >
                {msg.text}
                {msg.image && (
                  <div className="group relative mt-4 h-32 w-full cursor-pointer overflow-hidden rounded-lg border border-hairline">
                    <Image
                      src={msg.image.url}
                      alt={msg.image.caption}
                      fill
                      sizes="400px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-surface/80 to-transparent p-3">
                      <span className="font-headline text-sm tracking-wide text-accent">
                        {msg.image.caption}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex w-5/6 items-start">
              <div className="mr-4 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-hover">
                <Icon name="auto_awesome" className="text-sm text-accent" />
              </div>
              <div className="glass-panel rounded-xl rounded-tl-none p-5 font-body text-foreground-muted">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                  <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                  <span className="animate-bounce">.</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-hairline bg-surface/80 p-6 backdrop-blur-md">
          <div className="mb-4 flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap rounded-full border border-hairline px-4 py-2 font-body text-xs text-foreground-muted transition-all hover:border-accent/50 hover:text-accent"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder={t("assistant.chat.inputPlaceholder") ?? undefined}
              rows={1}
              className="w-full resize-none rounded-t border-0 border-b border-hairline bg-surface-hover/50 py-3 pl-4 pr-20 font-body text-foreground placeholder:text-foreground-muted/50 focus:border-accent focus:outline-none focus:ring-0"
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <button aria-label="Voice input" className="p-2 text-foreground-muted transition-colors hover:text-accent">
                <Icon name="mic" className="text-[20px]" />
              </button>
              <button
                aria-label="Send message"
                onClick={() => handleSend(input)}
                className="rounded bg-surface-hover p-2 text-accent transition-opacity hover:opacity-80"
              >
                <Icon name="send" filled className="text-[20px]" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between font-label text-[10px] uppercase tracking-widest text-foreground-muted">
            <span>{t("assistant.chat.languageLabel", { language: languages[currentLanguage].label })}</span>
            <Link href="/assistant" className="hover:text-accent">{t("assistant.chat.changeMode")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
