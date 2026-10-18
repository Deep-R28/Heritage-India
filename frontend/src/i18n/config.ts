import en from "./locales/en.json";
import hi from "./locales/hi.json";
import es from "./locales/es.json";
import bn from "./locales/bn.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import pa from "./locales/pa.json";
import ur from "./locales/ur.json";

/**
 * Multilingual registry for Heritage India.
 * Supports major Indian national & regional languages alongside English and Español.
 */
export const languages = {
  en: { label: "English", nativeLabel: "English", resources: en },
  hi: { label: "Hindi", nativeLabel: "हिन्दी", resources: hi },
  bn: { label: "Bengali", nativeLabel: "বাংলা", resources: bn },
  ta: { label: "Tamil", nativeLabel: "தமிழ்", resources: ta },
  te: { label: "Telugu", nativeLabel: "తెలుగు", resources: te },
  mr: { label: "Marathi", nativeLabel: "मराठी", resources: mr },
  gu: { label: "Gujarati", nativeLabel: "ગુજરાતી", resources: gu },
  kn: { label: "Kannada", nativeLabel: "ಕನ್ನಡ", resources: kn },
  ml: { label: "Malayalam", nativeLabel: "മലയാളം", resources: ml },
  pa: { label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", resources: pa },
  ur: { label: "Urdu", nativeLabel: "اردو", resources: ur },
  es: { label: "Spanish", nativeLabel: "Español", resources: es },
} as const;

export type LanguageCode = keyof typeof languages;

export const defaultLanguage: LanguageCode = "en";

export const LANGUAGE_STORAGE_KEY = "heritage-language";
