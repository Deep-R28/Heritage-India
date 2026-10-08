"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { VisionModeGrid } from "./accessibility-mode-switcher";
import { Icon } from "./icon";
import { cn } from "@/lib/cn";

/** Nav/footer-persistent entry point to the color-vision mode picker — the
 * same control shown once during onboarding, now reachable anytime. */
export function AccessibilityMenu({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        aria-label={t("accessibility.menuLabel") ?? undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center text-foreground transition-colors hover:text-accent"
      >
        <Icon name="palette" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-panel absolute right-0 top-full z-50 mt-2 w-60 rounded-lg p-4">
            <span className="mb-3 block font-label text-xs uppercase tracking-widest text-foreground-muted">
              {t("accessibility.colorVisionMode")}
            </span>
            <VisionModeGrid columns={1} />
          </div>
        </>
      )}
    </div>
  );
}
