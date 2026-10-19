"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/hooks/use-auth";
import {
  extractBookingFromText,
  saveBookingDraft,
  formatCheckoutUrl,
  formatAuthRedirectUrl,
  type BookingDraft,
} from "@/lib/booking-sync";

export function FormattedMessage({ text }: { text: string }) {
  const { isLoggedIn } = useAuth();

  // Extract booking details whenever text changes
  const bookingDraft = React.useMemo<BookingDraft | null>(() => {
    return extractBookingFromText(text);
  }, [text]);

  // Synchronize draft immediately to storage
  useEffect(() => {
    if (bookingDraft) {
      saveBookingDraft(bookingDraft);
    }
  }, [bookingDraft]);

  if (!text) return null;

  // Split lines
  const lines = text.split("\n");

  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-3 space-y-2 pl-1">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const renderFormattedInline = (str: string) => {
    // Regex to split by markdown links [text](url) and **bold**
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match;

    while ((match = linkRegex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(renderBold(str.substring(lastIdx, match.index), `sub-${lastIdx}`));
      }
      const label = match[1];
      let href = match[2];
      const isCheckout = href.startsWith("/checkout");
      const isLoginOrSignup = href.startsWith("/login") || href.startsWith("/signup");

      // Auto-attach redirect params if user clicks login/signup during booking
      if (isLoginOrSignup && bookingDraft) {
        href = formatAuthRedirectUrl(href.includes("signup") ? "signup" : "login", bookingDraft);
      }

      if (isCheckout) {
        const targetUrl = bookingDraft ? formatCheckoutUrl(bookingDraft) : href;
        parts.push(
          <span key={`link-${match.index}`} className="my-2 block">
            <Link
              href={targetUrl}
              onClick={() => {
                if (bookingDraft) saveBookingDraft(bookingDraft);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-label text-xs uppercase tracking-wider text-obsidian font-bold shadow-lg transition-transform hover:scale-102 hover:opacity-95"
            >
              <Icon name="payment" className="text-sm" />
              <span>{label.replace(/^[👉💳\s]+/, "")}</span>
              <span>→</span>
            </Link>
          </span>
        );
      } else {
        parts.push(
          <Link
            key={`link-${match.index}`}
            href={href}
            onClick={() => {
              if (bookingDraft) saveBookingDraft(bookingDraft);
            }}
            className="text-accent underline font-medium hover:opacity-80"
          >
            {label}
          </Link>
        );
      }
      lastIdx = linkRegex.lastIndex;
    }

    if (lastIdx < str.length) {
      parts.push(renderBold(str.substring(lastIdx), `sub-${lastIdx}`));
    }

    return parts;
  };

  const renderBold = (str: string, keyPrefix: string) => {
    const boldParts = str.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const content = part.slice(2, -2);
        const lower = content.toLowerCase();

        // Highlight crowd levels with distinctive tags
        if (lower.includes("crowd: low") || lower.includes("low (")) {
          return (
            <span
              key={`${keyPrefix}-${i}`}
              className="inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30"
            >
              {content}
            </span>
          );
        }
        if (lower.includes("crowd: high") || lower.includes("high (")) {
          return (
            <span
              key={`${keyPrefix}-${i}`}
              className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-xs font-bold text-amber-400 border border-amber-500/30"
            >
              {content}
            </span>
          );
        }
        if (lower.includes("crowd: moderate") || lower.includes("moderate (")) {
          return (
            <span
              key={`${keyPrefix}-${i}`}
              className="inline-flex items-center rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-400 border border-blue-500/30"
            >
              {content}
            </span>
          );
        }

        return (
          <strong key={`${keyPrefix}-${i}`} className="font-semibold text-accent">
            {content}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // Bullet points starting with -, •, or *
    if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
      const itemContent = line.replace(/^[-•*]\s*/, "");
      currentList.push(
        <li key={`li-${idx}`} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span className="flex-1">{renderFormattedInline(itemContent)}</span>
        </li>
      );
    } else {
      flushList();
      elements.push(
        <p key={`p-${idx}`} className="mb-2 text-sm leading-relaxed text-foreground last:mb-0">
          {renderFormattedInline(line)}
        </p>
      );
    }
  });

  flushList();

  return (
    <div className="space-y-1">
      {elements}

      {/* Interactive Booking Summary Card directly in chat */}
      {bookingDraft && (
        <div className="mt-4 overflow-hidden rounded-xl border border-accent/40 bg-surface-elevated/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <Icon name="confirmation_number" className="text-accent text-lg" />
              <span className="font-headline text-sm font-bold text-foreground">
                {bookingDraft.siteName}
              </span>
            </div>
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-label text-[10px] font-semibold uppercase tracking-wider text-accent border border-accent/30">
              Verified Booking
            </span>
          </div>

          <div className="my-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-surface/70 p-2 border border-hairline">
              <Icon name="group" className="text-foreground-muted text-sm shrink-0" />
              <div>
                <p className="text-[10px] uppercase text-foreground-muted font-label">Visitors</p>
                <p className="font-semibold text-foreground">{bookingDraft.partySize} Members</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface/70 p-2 border border-hairline">
              <Icon name="calendar_today" className="text-foreground-muted text-sm shrink-0" />
              <div>
                <p className="text-[10px] uppercase text-foreground-muted font-label">Visit Date</p>
                <p className="font-semibold text-foreground font-mono">{bookingDraft.visitDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface/70 p-2 border border-hairline">
              <Icon name="schedule" className="text-foreground-muted text-sm shrink-0" />
              <div>
                <p className="text-[10px] uppercase text-foreground-muted font-label">Time Slot</p>
                <p className="font-semibold text-foreground line-clamp-1">
                  {bookingDraft.visitSlot.split("(")[0].trim()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface/70 p-2 border border-hairline">
              <Icon name="verified_user" className="text-foreground-muted text-sm shrink-0" />
              <div>
                <p className="text-[10px] uppercase text-foreground-muted font-label">ASI Guide</p>
                <p className="font-semibold text-foreground line-clamp-1">
                  {bookingDraft.guideName || "Self-Guided"}
                </p>
              </div>
            </div>
          </div>

          {bookingDraft.totalINR && (
            <div className="mb-3 flex items-center justify-between border-t border-hairline pt-2 text-xs">
              <span className="text-foreground-muted">Estimated Total:</span>
              <span className="font-mono text-sm font-bold text-accent">
                ₹{bookingDraft.totalINR.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={formatCheckoutUrl(bookingDraft)}
              onClick={() => saveBookingDraft(bookingDraft)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 px-4 font-label text-xs uppercase font-bold text-obsidian shadow-lg transition-transform hover:scale-[1.02] hover:bg-accent/90 cursor-pointer"
            >
              <Icon name="payment" className="text-base" />
              <span>Proceed to Payment & Confirm Ticket</span>
              <span>→</span>
            </Link>
            {!isLoggedIn && (
              <Link
                href={formatAuthRedirectUrl("login", bookingDraft)}
                onClick={() => saveBookingDraft(bookingDraft)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-surface px-3 py-2 font-label text-xs uppercase font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                <Icon name="login" className="text-sm" />
                <span>Log In First</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
