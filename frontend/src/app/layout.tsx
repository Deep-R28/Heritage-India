import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Playfair_Display, Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Providers } from "./providers";
import { themeInitScript } from "@/hooks/use-theme";
import { AssistantFab } from "@/components/assistant/assistant-fab";
import { LANGUAGE_STORAGE_KEY, defaultLanguage, languages, type LanguageCode } from "@/i18n/config";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Heritage India | Explore More. Worry Less.",
  description:
    "Your intelligent concierge for India's heritage sites — crowd intelligence, verified guides, and an AI assistant, in one cinematic travel experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieLang = cookies().get(LANGUAGE_STORAGE_KEY)?.value;
  const initialLanguage: LanguageCode =
    cookieLang && cookieLang in languages ? (cookieLang as LanguageCode) : defaultLanguage;

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router has no _document.js; this is the correct place. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${playfairDisplay.variable} ${inter.variable} font-body antialiased`}>
        <Providers initialLanguage={initialLanguage}>
          {children}
          <AssistantFab />
        </Providers>
      </body>
    </html>
  );
}
