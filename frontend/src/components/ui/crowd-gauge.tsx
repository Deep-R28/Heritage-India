"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

export type CrowdLevel = "low" | "medium" | "high";

const levelToColorVar: Record<CrowdLevel, string> = {
  low: "rgb(var(--status-crowd-low))",
  medium: "rgb(var(--status-crowd-medium))",
  high: "rgb(var(--status-crowd-high))",
};

const levelLabelKey: Record<CrowdLevel, string> = {
  low: "map.crowdFilters.quiet",
  medium: "map.crowdFilters.moderate",
  high: "map.crowdFilters.busy",
};

function levelFromPercent(percent: number): CrowdLevel {
  if (percent < 40) return "low";
  if (percent < 75) return "medium";
  return "high";
}

function formatFreshness(timestamp?: string): string {
  if (!timestamp) return "Updated 2m ago";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `Updated ${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  return `Updated ${diffHours}h ago`;
}

/** Radial crowd gauge — thin 2px stroke ring, percentage centered in label-caps. */
export function CrowdGaugeRadial({
  percent,
  size = 64,
  showLabel = true,
  lastUpdated,
  className,
}: {
  percent: number;
  size?: number;
  showLabel?: boolean;
  lastUpdated?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const level = levelFromPercent(percent);
  const color = levelToColorVar[level];
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-hairline)"
            strokeWidth={2}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 500ms ease-out" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-label text-[10px] font-semibold tracking-wide"
          style={{ color }}
        >
          {Math.round(percent)}%
        </span>
      </div>
      {showLabel && (
        <span className="font-label text-[10px] uppercase tracking-widest text-foreground-muted">
          {t(levelLabelKey[level])}
        </span>
      )}
      <span className="font-mono text-[9px] text-foreground-muted/70">
        {formatFreshness(lastUpdated)}
      </span>
    </div>
  );
}

/** Horizontal bar meter variant of the crowd gauge. */
export function CrowdGaugeBar({
  percent,
  lastUpdated,
  className,
}: {
  percent: number;
  lastUpdated?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const level = levelFromPercent(percent);
  const color = levelToColorVar[level];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        <div className="h-1 w-24 flex-1 overflow-hidden rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
        <span className="font-label text-[10px] uppercase tracking-widest" style={{ color }}>
          {t(levelLabelKey[level])}
        </span>
      </div>
      <span className="font-mono text-[9px] text-foreground-muted/70">
        {formatFreshness(lastUpdated)}
      </span>
    </div>
  );
}

// Compact gauge for lists and cards
export function CrowdGauge({
  percent,
  size = "md",
  className,
}: {
  percent: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pixelSize = size === "sm" ? 36 : size === "lg" ? 80 : 54;
  return <CrowdGaugeRadial percent={percent} size={pixelSize} className={className} />;
}
