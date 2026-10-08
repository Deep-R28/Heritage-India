"use client";

import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";

const pillarMeta = [
  { key: "curation", index: "01", icon: "auto_awesome", large: true },
  { key: "context", index: "02", icon: "menu_book", large: false },
  { key: "conservation", index: "03", icon: "architecture", large: false },
] as const;

const teamMeta = [
  { name: "Dr. Ananya Rao", roleKey: "historian" },
  { name: "Vikram Sethi", roleKey: "conservation" },
  { name: "Elena Rust", roleKey: "digital" },
] as const;

function Monogram({ name }: { name: string }) {
  const initial = name.replace(/^Dr\.\s*/, "").charAt(0);
  return (
    <div className="relative mb-6 flex aspect-[3/4] w-full items-center justify-center overflow-hidden border border-hairline bg-surface-hover transition-colors duration-500 group-hover:border-accent/40">
      <span className="font-headline text-7xl text-accent/40 transition-colors duration-500 group-hover:text-accent">
        {initial}
      </span>
    </div>
  );
}

export function AboutView() {
  const { t } = useTranslation();
  const pillars = pillarMeta.map((p) => ({
    ...p,
    label: t(`about.pillars.${p.key}.label`),
    title: t(`about.pillars.${p.key}.title`),
    body: t(`about.pillars.${p.key}.body`),
  }));
  const team = teamMeta.map((m) => ({ name: m.name, role: t(`about.team.roles.${m.roleKey}`) }));

  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[60vh] w-full items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-background to-background" />
        <div className="relative z-10 mx-auto w-full max-w-shell px-8 text-center">
          <p className="mb-6 font-label text-sm uppercase tracking-[0.3em] text-accent opacity-80">
            {t("about.hero.eyebrow")}
          </p>
          <h1 className="font-headline text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl">
            {t("about.hero.titleLine1")}
            <br />
            <span className="font-normal italic text-accent">{t("about.hero.titleLine2")}</span>
          </h1>
        </div>
      </section>

      {/* Editorial statement */}
      <section className="mx-auto max-w-[1000px] px-8 py-32">
        <div className="flex flex-col items-start gap-16 md:flex-row">
          <Reveal className="sticky top-32 md:w-1/3">
            <div className="mb-8 h-px w-12 bg-accent/50" />
            <h2 className="mb-4 font-headline text-3xl text-foreground">
              {t("about.statement.heading")}
            </h2>
            <p className="font-body text-sm leading-relaxed text-foreground-muted">
              {t("about.statement.intro")}
            </p>
          </Reveal>
          <Reveal className="font-body leading-relaxed text-foreground-muted md:w-2/3" delay={0.1}>
            <p className="mb-12 text-xl font-light leading-loose text-foreground">
              {t("about.statement.p1")}
            </p>
            <div className="relative my-16 border-l border-accent pl-8">
              <span className="absolute -left-5 -top-4 font-headline text-6xl text-accent/20">
                &ldquo;
              </span>
              <p className="font-headline text-2xl italic leading-snug text-foreground md:text-3xl">
                {t("about.statement.quote")}
              </p>
            </div>
            <p className="mb-8">{t("about.statement.p2")}</p>
            <p>{t("about.statement.p3")}</p>
          </Reveal>
        </div>
      </section>

      {/* Core pillars */}
      <section className="mx-auto max-w-shell border-t border-hairline px-8 py-32">
        <Reveal>
          <h2 className="mb-20 text-center font-headline text-4xl text-foreground">
            {t("about.pillars.heading")}
          </h2>
        </Reveal>
        <div className="grid auto-rows-min grid-cols-1 gap-8 md:grid-cols-12">
          {pillars.map((p, i) => (
            <Reveal
              key={p.key}
              delay={i * 0.1}
              className={p.large ? "md:col-span-8 md:row-span-2" : "md:col-span-4"}
            >
              <Card
                className={
                  p.large
                    ? "flex min-h-[500px] flex-col justify-end p-10"
                    : "flex min-h-[240px] flex-col justify-between p-8"
                }
              >
                <div>
                  <span className="mb-4 block font-label text-xs uppercase tracking-widest text-accent">
                    {p.index} / {p.label}
                  </span>
                  <h3 className={p.large ? "mb-3 font-headline text-3xl text-foreground" : "mb-2 font-headline text-xl text-foreground"}>
                    {p.title}
                  </h3>
                  <p className={p.large ? "max-w-md font-body text-foreground-muted" : "font-body text-sm text-foreground-muted"}>
                    {p.body}
                  </p>
                </div>
                <div className={p.large ? "mt-6 text-accent" : "mt-4 self-end text-accent"}>
                  <Icon name={p.icon} className="text-2xl" />
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="w-full border-t border-hairline bg-surface/40 py-32">
        <div className="mx-auto max-w-shell px-8">
          <Reveal className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div>
              <h2 className="mb-4 font-headline text-4xl text-foreground">{t("about.team.heading")}</h2>
              <p className="max-w-lg font-body text-foreground-muted">{t("about.team.body")}</p>
            </div>
            <div className="h-px w-24 bg-accent/40" />
          </Reveal>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={i * 0.1} className="group cursor-default">
                <Monogram name={member.name} />
                <h3 className="font-headline text-xl text-foreground transition-colors group-hover:text-accent">
                  {member.name}
                </h3>
                <p className="mt-1 font-label text-xs uppercase tracking-wider text-foreground-muted">
                  {member.role}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
