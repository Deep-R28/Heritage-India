"use client";

import React from "react";

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
    // Regex to capture **bold** fragments
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const content = part.slice(2, -2);
        const lower = content.toLowerCase();

        // Highlight crowd levels with distinctive tags
        if (lower.includes("crowd: low") || lower.includes("low (")) {
          return (
            <span
              key={i}
              className="inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30"
            >
              {content}
            </span>
          );
        }
        if (lower.includes("crowd: high") || lower.includes("high (")) {
          return (
            <span
              key={i}
              className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-xs font-bold text-amber-400 border border-amber-500/30"
            >
              {content}
            </span>
          );
        }
        if (lower.includes("crowd: moderate") || lower.includes("moderate (")) {
          return (
            <span
              key={i}
              className="inline-flex items-center rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-400 border border-blue-500/30"
            >
              {content}
            </span>
          );
        }

        return (
          <strong key={i} className="font-semibold text-accent">
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
