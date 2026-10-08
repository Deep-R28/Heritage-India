"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { I18nProvider } from "@/i18n/provider";
import type { LanguageCode } from "@/i18n/config";

export function Providers({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}) {
  return (
    <I18nProvider initialLanguage={initialLanguage}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
