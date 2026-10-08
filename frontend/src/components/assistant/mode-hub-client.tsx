"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { ASSISTANT_PREFERENCE_KEY, type AssistantMode } from "@/lib/assistant";

export function ModeHubClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ASSISTANT_PREFERENCE_KEY) as AssistantMode | null;
    if (saved) router.replace(`/assistant/${saved}`);
  }, [router]);

  const choose = (mode: AssistantMode) => {
    if (remember) localStorage.setItem(ASSISTANT_PREFERENCE_KEY, mode);
    router.push(`/assistant/${mode}`);
  };

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-shell flex-grow flex-col items-center justify-center px-4 pt-24 md:px-8">
      <div className="mb-16 max-w-2xl text-center">
        <h1 className="mb-6 font-headline text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          {t("assistant.hub.heading")}
        </h1>
        <p className="font-body text-lg font-light text-foreground-muted md:text-xl">
          {t("assistant.hub.subtitle")}
        </p>
      </div>

      <div className="mb-16 grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <button
          onClick={() => choose("chat")}
          className="group glass-panel relative flex flex-col items-center overflow-hidden rounded-xl p-10 text-center transition-transform duration-300 hover:-translate-y-1 md:p-14"
        >
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-accent/30 bg-surface transition-colors duration-300 group-hover:border-accent/70">
            <Icon name="chat_bubble" className="text-4xl text-accent" />
          </div>
          <h2 className="mb-4 font-headline text-2xl font-medium text-foreground">{t("assistant.hub.chat.title")}</h2>
          <p className="mb-8 font-body text-sm leading-relaxed text-foreground-muted">
            {t("assistant.hub.chat.body")}
          </p>
          <div className="mt-auto w-full border-t border-hairline pt-4">
            <span className="flex items-center justify-center gap-2 font-label text-xs font-semibold uppercase tracking-widest text-accent transition-all duration-300 group-hover:tracking-[0.2em]">
              {t("assistant.hub.chat.cta")} <Icon name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </button>

        <button
          onClick={() => choose("voice")}
          className="group glass-panel relative flex flex-col items-center overflow-hidden rounded-xl p-10 text-center transition-transform duration-300 hover:-translate-y-1 md:p-14"
        >
          <div className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-accent/30 bg-surface transition-colors duration-300 group-hover:border-accent/70">
            <div className="absolute inset-0 animate-ping rounded-full border border-accent/20 opacity-50 [animation-duration:3s]" />
            <Icon name="mic" className="text-4xl text-accent" />
          </div>
          <h2 className="mb-4 font-headline text-2xl font-medium text-foreground">{t("assistant.hub.voice.title")}</h2>
          <p className="mb-8 font-body text-sm leading-relaxed text-foreground-muted">
            {t("assistant.hub.voice.body")}
          </p>
          <div className="mt-auto w-full border-t border-hairline pt-4">
            <span className="flex items-center justify-center gap-2 font-label text-xs font-semibold uppercase tracking-widest text-accent transition-all duration-300 group-hover:tracking-[0.2em]">
              {t("assistant.hub.voice.cta")} <Icon name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </button>
      </div>

      <div className="glass-panel mb-16 flex items-center gap-4 rounded-full px-6 py-4">
        <span className="font-label text-xs uppercase tracking-wider text-foreground-muted">
          {t("assistant.hub.alwaysAsk")}
        </span>
        <button
          role="switch"
          aria-checked={remember}
          onClick={() => setRemember((r) => !r)}
          className={cn(
            "relative h-6 w-12 rounded-full border transition-colors",
            remember ? "border-accent bg-accent/80" : "border-hairline bg-surface-hover",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform",
              remember ? "translate-x-6" : "translate-x-0.5",
            )}
          />
        </button>
        <span className="font-label text-xs uppercase tracking-wider text-foreground-muted">
          {t("assistant.hub.rememberChoice")}
        </span>
      </div>
    </main>
  );
}
