import type { LanguageCode } from "@/i18n/config";

/**
 * Fixed month-name tables instead of `Intl`/`toLocaleDateString`. The two run
 * on different ICU builds (Node on the server vs. the browser on the
 * client) and can disagree on the exact spelling of a long month name in
 * Hindi (e.g. "अक्तूबर" vs "अक्टूबर"), which throws a hydration mismatch on
 * every date. A fixed table is identical on both sides by construction.
 */
const MONTHS: Record<LanguageCode, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  hi: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};

/** Formats an ISO date string (day + long month name + year) matching the active i18n language. */
export function formatLocaleDate(iso: string, lang: string) {
  const code = (lang?.slice(0, 2) as LanguageCode) in MONTHS ? (lang.slice(0, 2) as LanguageCode) : "en";
  const date = new Date(iso);
  const day = date.getUTCDate();
  const month = MONTHS[code][date.getUTCMonth()];
  const year = date.getUTCFullYear();
  if (code === "en") return `${month} ${day}, ${year}`;
  if (code === "es") return `${day} de ${month} de ${year}`;
  return `${day} ${month} ${year}`;
}
