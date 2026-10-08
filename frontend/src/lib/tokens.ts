/**
 * Design tokens — mirrors DESIGN.md Sections 1–2 exactly.
 * Single source of truth for anything that needs a raw hex value in JS
 * (Recharts series colors, Three.js materials, Leaflet markers).
 * Everything else should reference the CSS custom properties in globals.css.
 */

export const brand = {
  obsidian: "#0B0B0B",
  charcoal: "#1A1A1A",
  warmIvory: "#FDFCF8",
  stone: "#F2F0E9",
  gold: "#C9A24B",
  terracotta: "#B5573B",
} as const;

export type VisionMode = "default" | "protanopia" | "deuteranopia" | "tritanopia";

export const statusTokens: Record<
  VisionMode,
  {
    crowdLow: string;
    crowdMedium: string;
    crowdHigh: string;
    verified: string;
    warning: string;
    error: string;
    paymentSuccess: string;
    paymentFailure: string;
  }
> = {
  default: {
    crowdLow: "#2E7D32",
    crowdMedium: "#FFA000",
    crowdHigh: "#D32F2F",
    verified: "#C9A24B",
    warning: "#FFA000",
    error: "#D32F2F",
    paymentSuccess: "#C9A24B",
    paymentFailure: "#D32F2F",
  },
  protanopia: {
    crowdLow: "#0072B2",
    crowdMedium: "#F0E442",
    crowdHigh: "#D55E00",
    verified: "#56B4E9",
    warning: "#F0E442",
    error: "#D55E00",
    paymentSuccess: "#56B4E9",
    paymentFailure: "#D55E00",
  },
  deuteranopia: {
    crowdLow: "#0072B2",
    crowdMedium: "#F0E442",
    crowdHigh: "#D55E00",
    verified: "#56B4E9",
    warning: "#F0E442",
    error: "#D55E00",
    paymentSuccess: "#56B4E9",
    paymentFailure: "#D55E00",
  },
  tritanopia: {
    crowdLow: "#009E73",
    crowdMedium: "#E69F00",
    crowdHigh: "#CC79A7",
    verified: "#56B4E9",
    warning: "#E69F00",
    error: "#CC79A7",
    paymentSuccess: "#56B4E9",
    paymentFailure: "#CC79A7",
  },
};

export const spacing = {
  marginMobile: "20px",
  marginDesktop: "64px",
  gutter: "24px",
  stackSm: "8px",
  stackMd: "16px",
  stackLg: "32px",
  stackXl: "80px",
};

export const radius = {
  sm: "0.125rem",
  DEFAULT: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
};

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "heritage-theme";
export const VISION_MODE_STORAGE_KEY = "heritage-vision-mode";
