"use client";

import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type BadgeTone = "neutral" | "verified" | "warning" | "error" | "success";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-hover text-foreground-muted border-hairline",
  verified: "bg-verified/10 text-verified border-verified/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  error: "bg-error/10 text-error border-error/30",
  success: "bg-payment-success/10 text-payment-success border-payment-success/30",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-1 font-label text-[10px] font-semibold uppercase tracking-widest",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** The "ASI Licensed" premium seal used on verified-guide surfaces. */
export function VerifiedSeal({ label, className }: { label?: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-verified/40 bg-verified/10 px-3 py-1.5 font-label text-xs font-semibold uppercase tracking-widest text-verified",
        className,
      )}
    >
      <Icon name="verified" className="text-sm" filled />
      {label ?? t("guides.verifiedSeal")}
    </span>
  );
}
