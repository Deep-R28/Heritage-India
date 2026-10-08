"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { AccessibilityMenu } from "@/components/ui/accessibility-menu";

const links = [
  { href: "/about", key: "sitemap" as const, label: "Sitemap" },
  { href: "/about", key: "privacy" as const, label: "Privacy Policy" },
  { href: "/about", key: "terms" as const, label: "Terms of Service" },
  { href: "/about", key: "cookies" as const, label: "Cookie Settings" },
  { href: "/contact", key: "newsletter" as const, label: "Newsletter" },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative z-20 mt-auto w-full border-t border-hairline bg-surface/60 px-8 py-20">
      <div className="mx-auto grid max-w-content grid-cols-1 gap-16 md:grid-cols-4">
        <div className="col-span-1">
          <Link href="/" className="mb-4 block font-headline text-xl text-accent">
            Heritage India
          </Link>
          <p className="font-label text-xs uppercase tracking-tighter text-foreground-muted">
            © {new Date().getFullYear()} Heritage India. {t("footer.tagline")}
          </p>
        </div>
        <div className="col-span-1 flex flex-wrap items-start gap-x-12 gap-y-6 md:col-span-2 md:justify-center">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-label text-xs uppercase tracking-tighter text-foreground-muted transition-transform duration-200 hover:translate-x-1 hover:text-accent"
            >
              {t(`footer.${link.key}`)}
            </Link>
          ))}
        </div>
        <div className="col-span-1 flex items-start justify-start gap-4 md:justify-end">
          <LanguageToggle />
          <AccessibilityMenu />
        </div>
      </div>
    </footer>
  );
}
