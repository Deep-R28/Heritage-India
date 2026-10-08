"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <SiteShell>
      <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
          <Icon name="account_balance" className="text-[40rem] text-accent" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <span className="mb-4 font-headline text-7xl text-accent md:text-8xl">404</span>
          <h1 className="mb-4 font-headline text-3xl text-foreground md:text-4xl">
            {t("notFound.title")}
          </h1>
          <p className="mb-10 max-w-md font-body text-foreground-muted">
            {t("notFound.body")}
          </p>
          <Link href="/explore">
            <Button>
              <Icon name="explore" className="text-sm" /> {t("notFound.cta")}
            </Button>
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
