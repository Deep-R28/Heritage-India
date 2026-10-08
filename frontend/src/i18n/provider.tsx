"use client";

import i18next from "i18next";
import { useMemo, type ReactNode } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { defaultLanguage, LANGUAGE_STORAGE_KEY, languages, type LanguageCode } from "./config";

const resources = Object.fromEntries(
  Object.entries(languages).map(([code, { resources }]) => [code, { translation: resources }]),
);

if (!i18next.isInitialized) {
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,
      detection: {
        order: ["cookie", "localStorage", "navigator"],
        lookupCookie: LANGUAGE_STORAGE_KEY,
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        caches: ["localStorage", "cookie"],
        cookieOptions: { path: "/", maxAge: 31536000, sameSite: "lax" },
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

/**
 * `initialLanguage` comes from the `heritage-language` cookie, read
 * server-side in the root layout, so the server's HTML and the client's
 * first hydration pass request the exact same language — without it, SSR
 * always renders English while the client immediately swaps to whatever
 * was stored, which throws a hydration mismatch on every translated node
 * once a non-English language is picked.
 *
 * The module-level `i18next` instance above is a singleton shared by every
 * concurrent request this Node server handles — mutating its `.language`
 * per-request would leak one visitor's language into another's response
 * (or, in dev with a single worker, just get stuck on whichever language
 * initialized it first). `cloneInstance` gives each render its own `lng`
 * while sharing the already-loaded resources/config, which is the
 * documented i18next pattern for exactly this multi-request SSR case.
 */
export function I18nProvider({
  children,
  initialLanguage = defaultLanguage,
}: {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}) {
  const instance = useMemo(() => i18next.cloneInstance({ lng: initialLanguage }), [initialLanguage]);
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
