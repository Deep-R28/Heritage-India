import en from "./locales/en.json";
import hi from "./locales/hi.json";
import es from "./locales/es.json";

/**
 * Adding a language: drop a new JSON file in ./locales, then add one entry
 * here. No component changes required — LanguageToggle reads this registry.
 */
export const languages = {
  en: { label: "English", nativeLabel: "English", resources: en },
  hi: { label: "Hindi", nativeLabel: "हिन्दी", resources: hi },
  es: { label: "Spanish", nativeLabel: "Español", resources: es },
} as const;

export type LanguageCode = keyof typeof languages;

export const defaultLanguage: LanguageCode = "en";

export const LANGUAGE_STORAGE_KEY = "heritage-language";
