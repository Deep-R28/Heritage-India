"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/hooks/use-auth";

const HERO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/4/4b/Hampi_virupaksha_temple.jpg";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = mode === "signup";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row">
      {/* Left: cinematic image */}
      <div className="relative h-1/3 w-full shrink-0 overflow-hidden md:h-full md:w-1/2">
        <div
          className="absolute inset-0 h-full w-full scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 md:bg-gradient-to-r md:to-background/80" />
        <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between p-8">
          <Link href="/" className="font-headline text-2xl font-bold tracking-wide text-accent drop-shadow-md">
            Heritage India
          </Link>
        </div>
        <div className="absolute bottom-12 left-8 z-10 hidden max-w-md md:bottom-24 md:left-16 md:block">
          <h1 className="mb-4 font-headline text-4xl leading-tight text-foreground drop-shadow-lg md:text-5xl">
            {t("auth.heroTitle")}
          </h1>
          <p className="font-body text-lg text-foreground-muted drop-shadow-md">
            {t("auth.heroSubtitle")}
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="relative z-10 flex h-2/3 w-full items-center justify-center bg-background p-6 md:h-full md:w-1/2 md:bg-transparent md:p-12">
        <div className="glass-panel relative flex w-full max-w-md flex-col overflow-hidden rounded-xl p-8 md:p-12">
          <div className="mb-8 flex border-b border-hairline">
            <Link
              href="/signup"
              className={cn(
                "flex-1 pb-3 text-center font-headline text-lg tracking-wide transition-colors",
                isSignup ? "border-b-2 border-accent text-accent" : "text-foreground-muted hover:text-accent",
              )}
            >
              {t("auth.signUpTab")}
            </Link>
            <Link
              href="/login"
              className={cn(
                "flex-1 pb-3 text-center font-headline text-lg tracking-wide transition-colors",
                !isSignup ? "border-b-2 border-accent text-accent" : "text-foreground-muted hover:text-accent",
              )}
            >
              {t("auth.loginTab")}
            </Link>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="relative flex flex-col-reverse">
                <input
                  className="museum-input w-full pb-2 pt-4"
                  id="fullname"
                  name="fullname"
                  placeholder=" "
                  required
                  type="text"
                />
                <label className="museum-label pointer-events-none absolute left-0 top-0" htmlFor="fullname">
                  {t("auth.fullName")}
                </label>
              </div>
            )}
            <div className="relative flex flex-col-reverse">
              <input
                className="museum-input w-full pb-2 pt-4"
                id="email"
                name="email"
                placeholder=" "
                required
                type="email"
              />
              <label className="museum-label pointer-events-none absolute left-0 top-0" htmlFor="email">
                {t("auth.email")}
              </label>
            </div>
            <div className="group relative flex flex-col-reverse">
              <input
                className="museum-input w-full pb-2 pr-10 pt-4"
                id="password"
                name="password"
                placeholder=" "
                required
                type={showPassword ? "text" : "password"}
              />
              <label className="museum-label pointer-events-none absolute left-0 top-0" htmlFor="password">
                {t("auth.password")}
              </label>
              <button
                aria-label="Toggle password visibility"
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute bottom-2 right-0 text-foreground-muted transition-colors hover:text-accent"
              >
                <Icon name="visibility" className="text-[20px]" />
              </button>
            </div>

            <button
              type="submit"
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded bg-accent px-6 py-4 font-body font-semibold text-accent-foreground transition-colors hover:opacity-90"
            >
              <span>{isSignup ? t("auth.createAccount") : t("auth.logIn")}</span>
              <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => router.push("/explore")}
                className="font-body text-sm tracking-wide text-foreground-muted transition-colors hover:text-accent"
              >
                {t("auth.continueAsGuest")}
              </button>
            </div>
          </form>

          <div className="pointer-events-none absolute right-0 top-0 m-4 h-16 w-16 rounded-tr-xl border-r border-t border-accent/40 opacity-50" />
          <div className="pointer-events-none absolute bottom-0 left-0 m-4 h-16 w-16 rounded-bl-xl border-b border-l border-accent/40 opacity-50" />
        </div>
      </div>
    </div>
  );
}
