"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { AccessibilityMenu } from "@/components/ui/accessibility-menu";

const navLinks = [
  { href: "/explore", key: "explore" as const },
  { href: "/guides/verify", key: "guides" as const },
  { href: "/pricing", key: "pricing" as const },
  { href: "/about", key: "about" as const },
];

export function TopNav({ minimal = false }: { minimal?: boolean }) {
  const { t } = useTranslation();
  const { isLoggedIn, user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <header className="fixed top-0 z-[2000] w-full border-b border-hairline bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-shell items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-accent">
          Heritage India
        </Link>

        {!minimal && (
          <nav className="hidden gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-label text-sm uppercase tracking-widest transition-colors duration-300",
                  pathname === link.href
                    ? "border-b-2 border-accent pb-1 font-bold text-accent"
                    : "text-foreground hover:text-accent",
                )}
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {!minimal && <LanguageToggle className="hidden md:block" />}
          {!minimal && <ThemeToggle className="hidden md:block" />}
          {!minimal && <AccessibilityMenu className="hidden md:block" />}

          {!minimal &&
            (isLoggedIn ? (
              <div className="relative hidden items-center gap-4 md:flex">
                <button
                  aria-label="Notifications"
                  className="rounded-full p-2 text-accent transition-all hover:bg-surface-hover"
                >
                  <Link href="/dashboard/notifications">
                    <Icon name="notifications" />
                  </Link>
                </button>
                <button
                  aria-label="Account menu"
                  onClick={() => setAvatarOpen((o) => !o)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 font-headline text-lg text-accent transition-colors hover:border-accent"
                >
                  {user?.initial ?? "U"}
                </button>
                {avatarOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
                    <div className="glass-panel absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg py-1">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 font-label text-xs uppercase tracking-widest text-foreground hover:bg-surface-hover hover:text-accent"
                      >
                        {t("nav.dashboard")}
                      </Link>
                      <Link
                        href="/dashboard/trips"
                        className="block px-4 py-2 font-label text-xs uppercase tracking-widest text-foreground hover:bg-surface-hover hover:text-accent"
                      >
                        {t("nav.myTrips")}
                      </Link>
                      <Link
                        href="/account/settings"
                        className="block px-4 py-2 font-label text-xs uppercase tracking-widest text-foreground hover:bg-surface-hover hover:text-accent"
                      >
                        {t("nav.settings")}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setAvatarOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left font-label text-xs uppercase tracking-widest text-error hover:bg-surface-hover"
                      >
                        {t("nav.logOut")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/signup" className="hidden md:block">
                <Button size="sm">{t("nav.signUp")}</Button>
              </Link>
            ))}

          {!minimal && (
            <button
              aria-label="Menu"
              className="text-foreground md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <Icon name={mobileOpen ? "close" : "menu"} />
            </button>
          )}
        </div>
      </div>

      {!minimal && mobileOpen && (
        <div className="glass-panel border-t-0 px-6 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-label text-sm uppercase tracking-widest text-foreground hover:text-accent"
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <LanguageToggle />
              <ThemeToggle />
              <AccessibilityMenu />
            </div>
            {isLoggedIn ? (
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="font-label text-sm uppercase tracking-widest text-foreground hover:text-accent">
                  {t("nav.dashboard")}
                </Link>
                <button onClick={logout} className="text-left font-label text-sm uppercase tracking-widest text-error">
                  {t("nav.logOut")}
                </button>
              </div>
            ) : (
              <Link href="/signup" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">
                  {t("nav.signUp")}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
