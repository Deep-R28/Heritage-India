"use client";

import { useTheme } from "@/hooks/use-theme";
import { Icon } from "./icon";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className={
        "flex items-center justify-center text-foreground transition-colors hover:text-accent " +
        (className ?? "")
      }
    >
      <Icon name={theme === "dark" ? "dark_mode" : "light_mode"} />
    </button>
  );
}
