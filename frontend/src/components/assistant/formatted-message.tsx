"use client";

import React from "react";
import Link from "next/link";

export function FormattedMessage({ text }: { text: string }) {
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
    // Supports URLs with parentheses e.g. [text](/checkout?...&slot=04:30 PM (Sunset Slot)&guide=...)
    const linkRegex = /\[([^\]]+)\]\(((?:[^()]+|\([^()]*\))*)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match;

    while ((match = linkRegex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(renderBold(str.substring(lastIdx, match.index), `sub-${lastIdx}`));
      }
      const label = match[1];
      const rawHref = match[2];
      const isCheckout = rawHref.startsWith("/checkout") || rawHref.includes("/checkout");

      if (isCheckout) {
        let targetHref = rawHref;
        let siteParam: string | null = null;
        let partyParam: string | null = null;
        let dateParam: string | null = null;
        let slotParam: string | null = null;
        let guideNameParam: string | null = null;
        let guideIdParam: string | null = null;

        try {
          const url = new URL(rawHref, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
          targetHref = `${url.pathname}${url.search}`;
          siteParam = url.searchParams.get("site") || url.searchParams.get("monument") || url.searchParams.get("place") || url.searchParams.get("siteSlug");
          partyParam = url.searchParams.get("partySize") || url.searchParams.get("members") || url.searchParams.get("visitors") || url.searchParams.get("tickets");
          dateParam = url.searchParams.get("date") || url.searchParams.get("visitDate");
          slotParam = url.searchParams.get("slot") || url.searchParams.get("time") || url.searchParams.get("visitSlot");
          guideNameParam = url.searchParams.get("guide") || url.searchParams.get("guideName");
          guideIdParam = url.searchParams.get("guideId");
        } catch {}

        parts.push(
          <span key={`link-${match.index}`} className="my-2 block">
            <Link
              href={targetHref}
              onClick={() => {
                if (typeof window !== "undefined") {
                  try {
                    localStorage.setItem(
                      "heritage_last_chat_booking",
                      JSON.stringify({
                        siteSlug: siteParam,
                        partySize: partyParam ? parseInt(partyParam, 10) : undefined,
                        visitDate: dateParam,
                        visitSlot: slotParam,
                        guideName: guideNameParam || guideIdParam,
                        guideId: guideIdParam || guideNameParam,
                      })
                    );
                  } catch {}
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-label text-xs uppercase tracking-wider text-background font-bold shadow-lg transition-transform hover:scale-102 hover:opacity-95"
            >
              <span>💳</span>
              <span>{label.replace(/^[👉💳\s]+/, "")}</span>
              <span>→</span>
            </Link>
          </span>
        );
      } else {
        parts.push(
          <Link
            key={`link-${match.index}`}
            href={rawHref}
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

  return <div className="space-y-1">{elements}</div>;
}
