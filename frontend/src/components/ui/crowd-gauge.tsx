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

/** Radial crowd gauge — thin 2px stroke ring, percentage centered in label-caps. */
export function CrowdGaugeRadial({
  percent,
  size = 64,
  showLabel = true,
  className,
}: {
  percent: number;
  size?: number;
  showLabel?: boolean;
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
    </div>
  );
}

/** Horizontal bar meter variant of the crowd gauge. */
export function CrowdGaugeBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const { t } = useTranslation();
  const level = levelFromPercent(percent);
  const color = levelToColorVar[level];

  return (
    <div className={cn("flex items-center gap-2", className)}>
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
  );
}
