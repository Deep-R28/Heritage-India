"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { languages, type LanguageCode } from "@/i18n/config";
import { Icon } from "./icon";
import { cn } from "@/lib/cn";

export function LanguageToggle({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = (i18n.language?.slice(0, 2) as LanguageCode) ?? "en";

  return (
    <div className={cn("relative", className)}>
      <button
        aria-label="Language"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center text-foreground transition-colors hover:text-accent"
      >
        <Icon name="language" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-panel absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-lg py-1">
            {Object.entries(languages).map(([code, { nativeLabel }]) => (
              <button
                key={code}
                onClick={() => {
                  i18n.changeLanguage(code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2 text-left font-label text-xs uppercase tracking-widest hover:bg-surface-hover",
                  current === code ? "text-accent" : "text-foreground",
                )}
              >
                {nativeLabel}
                {current === code && <Icon name="check" className="text-sm" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
