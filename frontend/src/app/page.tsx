"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { MonumentSceneLazy } from "@/components/three/monument-scene-lazy";
import { cn } from "@/lib/cn";

const problemIcons = ["groups", "menu_book", "map"] as const;
const problemKeys = ["crowds", "histories", "itineraries"] as const;

const howSteps = [
  { num: "01", key: "location" },
  { num: "02", key: "language" },
  { num: "03", key: "crowd" },
  { num: "04", key: "assistant" },
  { num: "05", key: "guide" },
  { num: "06", key: "pay" },
  { num: "07", key: "explore" },
] as const;

const featureItems = [
  { icon: "explore", key: "discovery" },
  { icon: "monitoring", key: "crowd" },
  { icon: "auto_awesome", key: "concierge", href: "/assistant" },
  { icon: "verified_user", key: "guides" },
  { icon: "compare_arrows", key: "alternatives" },
  { icon: "accessibility_new", key: "accessibility" },
] as const;

const statItems = [
  { value: "412", key: "sitesMapped" },
  { value: "1,860", key: "guidesVerified" },
  { value: "94%", key: "avoidPeakCrowds" },
  { value: "18", key: "languagesSupported" },
] as const;

export default function HomePage() {
  const { t } = useTranslation();
  const problems = problemKeys.map((key, i) => ({
    icon: problemIcons[i],
    title: t(`home.problems.items.${key}.title`),
    body: t(`home.problems.items.${key}.body`),
    cta: t(`home.problems.items.${key}.cta`),
  }));
  const howItWorks = howSteps.map((s) => ({
    step: s.num,
    title: t(`home.how.steps.${s.key}.title`),
    body: t(`home.how.steps.${s.key}.body`),
  }));
  const features = featureItems.map((f) => ({
    icon: f.icon,
    title: t(`home.features.items.${f.key}.title`),
    body: t(`home.features.items.${f.key}.body`),
    href: "href" in f ? f.href : undefined,
  }));
  const stats = statItems.map((s) => ({ value: s.value, label: t(`home.stats.${s.key}`) }));

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />

      {/* Hero */}
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 opacity-80">
          <MonumentSceneLazy />
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </div>
        <div className="relative z-20 flex max-w-4xl flex-col items-center px-4 text-center md:px-8">
          <h1 className="text-shadow-sm mb-6 font-headline text-5xl font-bold leading-tight text-foreground md:text-7xl lg:text-8xl">
            {t("home.hero.titleLine1")} <br />
            <span className="font-normal italic text-accent">{t("home.hero.titleLine2")}</span>
          </h1>
          <p className="text-shadow-sm mb-10 max-w-2xl font-body text-xl font-light text-foreground-muted md:text-2xl">
            {t("home.hero.subtitle")}
          </p>
          <Link href="/explore">
            <Button size="lg">
              {t("home.hero.cta")} <Icon name="arrow_forward" className="text-sm" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Problems */}
      <section className="relative z-20 mx-auto w-full max-w-shell px-4 py-24 md:px-8 lg:px-16">
        <Reveal className="mb-16 text-center">
          <span className="mb-4 block font-label text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("home.problems.eyebrow")}
          </span>
          <h2 className="font-headline text-3xl text-foreground md:text-4xl">{t("home.problems.heading")}</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <Card className="group flex h-full flex-col p-8 transition-transform duration-300 hover:-translate-y-2">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 text-accent transition-colors group-hover:bg-accent/10">
                  <Icon name={p.icon} />
                </div>
                <h3 className="mb-3 font-headline text-xl text-foreground">{p.title}</h3>
                <p className="mb-6 flex-grow font-body text-sm leading-relaxed text-foreground-muted">
                  {p.body}
                </p>
                <span className="flex w-max items-center gap-1 font-label text-xs uppercase tracking-wider text-accent transition-all hover:gap-2">
                  {p.cta} <Icon name="east" className="text-base" />
                </span>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works — 7 step timeline */}
      <section className="relative z-20 border-t border-hairline bg-surface/40 py-24">
        <div className="mx-auto max-w-shell px-4 md:px-8 lg:px-16">
          <Reveal className="mb-16 text-center">
            <span className="mb-4 block font-label text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {t("home.how.eyebrow")}
            </span>
            <h2 className="font-headline text-3xl text-foreground md:text-4xl">{t("home.how.heading")}</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-7">
            {howItWorks.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.06} className="relative">
                <div className="mb-4 font-headline text-3xl text-accent/40">{s.step}</div>
                <h3 className="mb-2 font-headline text-base text-foreground">{s.title}</h3>
                <p className="font-body text-xs leading-relaxed text-foreground-muted">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-20 mx-auto w-full max-w-shell px-4 py-24 md:px-8 lg:px-16">
        <Reveal className="mb-16 text-center">
          <span className="mb-4 block font-label text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("home.features.eyebrow")}
          </span>
          <h2 className="font-headline text-3xl text-foreground md:text-4xl">{t("home.features.heading")}</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const content = (
              <Card
                className={cn(
                  "flex h-full flex-col gap-4 p-6",
                  f.href && "transition-transform duration-300 hover:-translate-y-1",
                )}
              >
                <Icon name={f.icon} className="text-3xl text-accent" />
                <div>
                  <h3 className="mb-1 font-headline text-lg text-foreground">{f.title}</h3>
                  <p className="font-body text-sm text-foreground-muted">{f.body}</p>
                </div>
              </Card>
            );
            return (
              <Reveal key={f.title} delay={i * 0.08}>
                {f.href ? <Link href={f.href}>{content}</Link> : content}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Trust / stats band */}
      <section className="relative z-20 border-y border-hairline bg-surface/60 py-16">
        <div className="mx-auto grid max-w-shell grid-cols-2 gap-8 px-4 text-center md:grid-cols-4 md:px-8">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="font-headline text-4xl text-accent md:text-5xl">{s.value}</div>
              <div className="mt-2 font-label text-xs uppercase tracking-widest text-foreground-muted">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
