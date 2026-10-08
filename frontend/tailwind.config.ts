import type { Config } from "tailwindcss";

const config: Config = {
  // globals.css treats an unattributed <html> as dark (the default) and
  // opts into light via [data-theme="light"] — mirror that here so a future
  // `dark:` utility actually matches the app's real default state.
  darkMode: ["selector", ':not([data-theme="light"])'],
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x) / <alpha-value>) lets Tailwind opacity modifiers
        // (bg-accent/10, border-verified/30, …) actually generate CSS —
        // a bare `var(--x)` string can't be decomposed for alpha.
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        "foreground-muted": "rgb(var(--foreground-muted) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-hover": "rgb(var(--surface-hover) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-foreground": "rgb(var(--accent-foreground) / <alpha-value>)",
        // Bare `border-hairline` (no modifier) is meant to be the subtle,
        // pre-baked 20%-alpha line used everywhere by default — keep it a
        // plain rgba() so those dozens of call sites stay unchanged.
        hairline: "var(--border-hairline)",
        // Only for the rare spot that needs a different hairline alpha
        // (e.g. border-hairline-strong/60).
        "hairline-strong": "rgb(var(--hairline) / <alpha-value>)",
        obsidian: "#0B0B0B",
        charcoal: "#1A1A1A",
        "warm-ivory": "#FDFCF8",
        stone: "#F2F0E9",
        gold: "#C9A24B",
        terracotta: "#B5573B",
        "crowd-low": "rgb(var(--status-crowd-low) / <alpha-value>)",
        "crowd-medium": "rgb(var(--status-crowd-medium) / <alpha-value>)",
        "crowd-high": "rgb(var(--status-crowd-high) / <alpha-value>)",
        verified: "rgb(var(--status-verified) / <alpha-value>)",
        warning: "rgb(var(--status-warning) / <alpha-value>)",
        error: "rgb(var(--status-error) / <alpha-value>)",
        "payment-success": "rgb(var(--status-payment-success) / <alpha-value>)",
        "payment-failure": "rgb(var(--status-payment-failure) / <alpha-value>)",
      },
      fontFamily: {
        headline: ["var(--font-headline)"],
        display: ["var(--font-headline)"],
        body: ["var(--font-body)"],
        label: ["var(--font-body)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-default)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      spacing: {
        "margin-mobile": "var(--space-margin-mobile)",
        "margin-desktop": "var(--space-margin-desktop)",
        gutter: "var(--space-gutter)",
        "stack-sm": "var(--space-stack-sm)",
        "stack-md": "var(--space-stack-md)",
        "stack-lg": "var(--space-stack-lg)",
        "stack-xl": "var(--space-stack-xl)",
      },
      maxWidth: {
        content: "1200px",
        shell: "1440px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
};
export default config;
