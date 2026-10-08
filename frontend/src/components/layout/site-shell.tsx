import type { ReactNode } from "react";
import { TopNav } from "./top-nav";
import { Footer } from "./footer";
import { cn } from "@/lib/cn";

/**
 * Standard page shell: fixed TopNav + footer, shared by every page. Pages that
 * need a minimal nav (Signup/Login) or no footer pass the flags below.
 */
export function SiteShell({
  children,
  minimalNav = false,
  hideFooter = false,
  mainClassName,
}: {
  children: ReactNode;
  minimalNav?: boolean;
  hideFooter?: boolean;
  mainClassName?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav minimal={minimalNav} />
      <main className={cn("flex-grow", mainClassName)}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
