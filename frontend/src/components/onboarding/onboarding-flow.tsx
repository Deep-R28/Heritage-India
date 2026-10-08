"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { AccessibilityModeSwitcher } from "@/components/ui/accessibility-mode-switcher";
import { languages, type LanguageCode } from "@/i18n/config";

const TOTAL_STEPS = 3;

function StepProgress({ step }: { step: number }) {
  const { t } = useTranslation();
  return (
    <div className="mb-12 flex items-center justify-between">
      <div className="flex w-1/2 gap-2 sm:w-1/3">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-full", i < step ? "bg-accent" : "bg-surface-hover")}
          />
        ))}
      </div>
      <span className="font-label text-xs uppercase tracking-widest text-accent">
        {t("onboarding.step", { current: step, total: TOTAL_STEPS })}
      </span>
    </div>
  );
}

function StepLocation({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-10 flex h-48 w-48 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,162,75,0.2) 0%, rgba(201,162,75,0) 70%)",
            animation: "pulse-glow 4s ease-in-out infinite alternate",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full border border-accent/30 bg-surface-hover/40" />
        <div className="relative z-10 text-accent" style={{ animation: "drop-bounce 2s cubic-bezier(0.28,0.84,0.42,1) infinite" }}>
          <Icon name="location_on" filled className="text-6xl" />
          <div className="absolute -bottom-2 left-1/2 h-2 w-8 -translate-x-1/2 rounded-[100%] bg-accent/40 blur-sm" />
        </div>
      </div>
      <h1 className="mb-6 font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {t("onboarding.location.title")}
      </h1>
      <p className="mx-auto mb-12 max-w-md font-body text-lg leading-relaxed text-foreground-muted">
        {t("onboarding.location.body")}
      </p>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <button
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded bg-accent px-6 py-4 font-body font-semibold text-accent-foreground shadow-lg transition-all hover:opacity-90"
        >
          <Icon name="near_me" />
          {t("onboarding.location.allow")}
        </button>
        <button
          onClick={onSkip}
          className="w-full rounded border border-hairline px-6 py-4 font-body text-foreground-muted transition-colors hover:bg-surface-hover/50"
        >
          {t("onboarding.location.skip")}
        </button>
      </div>
      <p className="mt-8 font-label text-xs uppercase tracking-wide text-foreground-muted/60">
        {t("onboarding.location.note")}
      </p>
    </div>
  );
}

function StepLanguage({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState<LanguageCode>(
    (i18n.language?.slice(0, 2) as LanguageCode) ?? "en",
  );

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-headline text-4xl font-semibold tracking-wide text-foreground md:text-5xl">
          {t("onboarding.language.title")}
        </h1>
        <p className="mx-auto max-w-lg font-body text-lg text-foreground-muted">
          {t("onboarding.language.body")}
        </p>
      </div>
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Object.entries(languages).map(([code, { label, nativeLabel }]) => (
          <button
            key={code}
            onClick={() => setSelected(code as LanguageCode)}
            className={cn(
              "glass-panel flex w-full items-center justify-between rounded-lg p-6 text-left transition-all duration-300",
              selected === code && "border-accent/60",
            )}
          >
            <div>
              <div className="mb-1 font-headline text-2xl text-foreground">{nativeLabel}</div>
              <div className="font-body text-sm text-foreground-muted">{label}</div>
            </div>
            <Icon
              name="check_circle"
              filled
              className={cn("text-2xl text-accent transition-opacity duration-300", selected !== code && "opacity-0")}
            />
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-hairline pt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-label text-sm uppercase tracking-wider text-foreground-muted transition-colors hover:text-foreground"
        >
          <Icon name="arrow_back" className="text-sm" />
          {t("common.back")}
        </button>
        <button
          onClick={() => {
            i18n.changeLanguage(selected);
            onNext();
          }}
          className="flex items-center gap-2 rounded bg-accent px-8 py-3 font-body font-medium tracking-wide text-accent-foreground transition-colors hover:opacity-90"
        >
          {t("onboarding.language.continue")}
          <Icon name="arrow_forward" className="text-sm" />
        </button>
      </div>
    </div>
  );
}

function StepAccessibility({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-headline text-4xl font-semibold tracking-wide text-foreground md:text-5xl">
          {t("onboarding.accessibility.title")}
        </h1>
        <p className="mx-auto max-w-lg font-body text-lg text-foreground-muted">
          {t("onboarding.accessibility.body")}
        </p>
      </div>
      <AccessibilityModeSwitcher className="mx-auto mb-12 max-w-md" />
      <div className="flex items-center justify-between border-t border-hairline pt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-label text-sm uppercase tracking-wider text-foreground-muted transition-colors hover:text-foreground"
        >
          <Icon name="arrow_back" className="text-sm" />
          {t("common.back")}
        </button>
        <button
          onClick={onFinish}
          className="flex items-center gap-2 rounded bg-accent px-8 py-3 font-body font-medium tracking-wide text-accent-foreground transition-colors hover:opacity-90"
        >
          {t("onboarding.accessibility.finish")}
          <Icon name="arrow_forward" className="text-sm" />
        </button>
      </div>
    </div>
  );
}

export function OnboardingFlow() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
      <style>{`
        @keyframes pulse-glow { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.1); opacity: 0.4; } }
        @keyframes drop-bounce { 0% { transform: translateY(-30px); opacity: 0; } 50% { transform: translateY(0); opacity: 1; } 65% { transform: translateY(-10px); } 80%, 100% { transform: translateY(0); } }
      `}</style>
      <nav className="fixed top-0 z-50 w-full border-b border-hairline bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-shell items-center justify-between px-8 py-4">
          <Link href="/" className="font-headline text-2xl font-bold text-accent">
            Heritage India
          </Link>
          <span className="font-body text-sm text-foreground-muted">{t("onboarding.step", { current: step, total: TOTAL_STEPS })}</span>
        </div>
      </nav>

      <main className="relative z-10 flex flex-grow items-center justify-center px-6 pb-12 pt-24 lg:px-20">
        <div className="glass-panel w-full max-w-2xl rounded-xl p-10 md:p-16">
          <StepProgress step={step} />
          {step === 1 && (
            <StepLocation onNext={() => setStep(2)} onSkip={() => setStep(2)} />
          )}
          {step === 2 && <StepLanguage onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && (
            <StepAccessibility onFinish={() => router.push("/explore")} onBack={() => setStep(2)} />
          )}
        </div>
      </main>
    </div>
  );
}
