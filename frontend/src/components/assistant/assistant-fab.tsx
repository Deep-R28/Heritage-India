"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/icon";
import { ASSISTANT_PREFERENCE_KEY, type AssistantMode } from "@/lib/assistant";

// Transactional / immersive flows that shouldn't show a floating entry point
// on top of them (assistant pages themselves, auth, onboarding).
const HIDDEN_PREFIXES = ["/assistant", "/signup", "/login", "/onboarding"];

export function AssistantFab() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [href, setHref] = useState("/assistant");

  useEffect(() => {
    const saved = localStorage.getItem(ASSISTANT_PREFERENCE_KEY) as AssistantMode | null;
    if (saved) setHref(`/assistant/${saved}`);
  }, []);

  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <Link
      href={href}
      aria-label="Ask the Heritage concierge"
      className="group fixed bottom-6 right-6 z-[1500] flex items-center gap-3 rounded-full bg-accent px-5 py-4 text-accent-foreground shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all duration-300 hover:pr-6 hover:shadow-[0_0_30px_rgba(201,162,75,0.45)] md:bottom-8 md:right-8"
    >
      <Icon name="auto_awesome" filled className="text-xl" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-label text-xs font-semibold uppercase tracking-widest opacity-0 transition-all duration-300 group-hover:max-w-[160px] group-hover:opacity-100">
        {t("assistant.fab.label")}
      </span>
    </Link>
  );
}
