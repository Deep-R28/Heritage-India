"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  VISION_MODE_STORAGE_KEY,
  type Theme,
  type VisionMode,
} from "@/lib/tokens";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  visionMode: VisionMode;
  setVisionMode: (mode: VisionMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Inline script injected before hydration so there's no flash of the wrong theme. */
export const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('${THEME_STORAGE_KEY}') || 'dark';
    var vision = localStorage.getItem('${VISION_MODE_STORAGE_KEY}') || 'default';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-vision-mode', vision);
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [visionMode, setVisionModeState] = useState<VisionMode>("default");

  useEffect(() => {
    const storedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "dark";
    const storedVision =
      (localStorage.getItem(VISION_MODE_STORAGE_KEY) as VisionMode | null) ?? "default";
    setThemeState(storedTheme);
    setVisionModeState(storedVision);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const setVisionMode = useCallback((next: VisionMode) => {
    setVisionModeState(next);
    localStorage.setItem(VISION_MODE_STORAGE_KEY, next);
    document.documentElement.setAttribute("data-vision-mode", next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, visionMode, setVisionMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
