"use client";

import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/use-theme";
import { statusTokens, type VisionMode } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

const modeIds: VisionMode[] = ["default", "protanopia", "deuteranopia", "tritanopia"];

/** Live swatch preview of crowd-low/medium/high + verified for one vision mode. */
function ModeSwatches({ mode }: { mode: VisionMode }) {
  const { t } = useTranslation();
  const tokens = statusTokens[mode];
  const swatches = [
    { label: t("accessibility.swatch.low"), color: tokens.crowdLow },
    { label: t("accessibility.swatch.medium"), color: tokens.crowdMedium },
    { label: t("accessibility.swatch.high"), color: tokens.crowdHigh },
    { label: t("accessibility.swatch.verified"), color: tokens.verified },
  ];
  return (
    <div className="flex gap-1.5">
      {swatches.map((s) => (
        <span
          key={s.label}
          title={s.label}
          className="h-3 w-3 rounded-full border border-white/10"
          style={{ backgroundColor: s.color }}
        />
      ))}
    </div>
  );
}

/** Just the color-vision mode grid — reused by the full switcher and the compact nav/footer popover. */
export function VisionModeGrid({ className, columns = 2 }: { className?: string; columns?: 1 | 2 }) {
  const { t } = useTranslation();
  const { visionMode, setVisionMode } = useTheme();

  return (
    <div className={cn("grid grid-cols-1 gap-3", columns === 2 && "sm:grid-cols-2", className)}>
      {modeIds.map((id) => (
        <button
          key={id}
          onClick={() => setVisionMode(id)}
          className={cn(
            "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
            visionMode === id
              ? "border-accent bg-accent/10"
              : "border-hairline hover:border-accent/40",
          )}
        >
          <span
            className={cn(
              "font-label text-xs uppercase tracking-widest",
              visionMode === id ? "text-accent" : "text-foreground-muted",
            )}
          >
            {t(`accessibility.modes.${id}`)}
          </span>
          <ModeSwatches mode={id} />
        </button>
      ))}
    </div>
  );
}

/** Just the light/dark theme picker — reused by the full switcher and the standalone Settings > Theme panel. */
export function ThemePicker({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex gap-3", className)}>
      {(["dark", "light"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setTheme(mode)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-3 font-label text-xs uppercase tracking-widest transition-colors",
            theme === mode
              ? "border-accent text-accent bg-accent/10"
              : "border-hairline text-foreground-muted hover:border-accent/40",
          )}
        >
          <Icon name={mode === "dark" ? "dark_mode" : "light_mode"} className="text-base" />
          {t(mode === "dark" ? "accessibility.themeDark" : "accessibility.themeLight")}
        </button>
      ))}
    </div>
  );
}

export function AccessibilityModeSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div>
        <span className="mb-3 block font-label text-xs uppercase tracking-widest text-foreground-muted">
          {t("common.theme")}
        </span>
        <ThemePicker />
      </div>

      <div>
        <span className="mb-3 block font-label text-xs uppercase tracking-widest text-foreground-muted">
          {t("accessibility.colorVisionMode")}
        </span>
        <VisionModeGrid />
      </div>
    </div>
  );
}
