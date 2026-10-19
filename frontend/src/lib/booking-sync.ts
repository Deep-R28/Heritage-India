/**
 * Booking synchronization utility.
 * Guarantees that chat conversations, quick links, and checkout
 * reflect the EXACT booking details (monument, guide, date, slot, visitor count)
 * across logged-in and non-logged-in states.
 */

export interface BookingDraft {
  siteSlug: string;
  siteName: string;
  partySize: number;
  visitDate: string;
  visitSlot: string;
  guideName?: string;
  guideId?: string;
  totalINR?: number;
  leadVisitor?: {
    fullName: string;
    email: string;
    phone: string;
    idType: string;
    idNumber: string;
  };
}

export const STORAGE_KEY_CHAT_BOOKING = "heritage_last_chat_booking";
export const STORAGE_KEY_PENDING_DRAFT = "pending_booking_draft";

/**
 * Normalizes any visit slot string into one of the 4 standard slots used in the UI.
 */
export function normalizeSlot(raw?: string | null): string {
  if (!raw) return "09:00 AM - 12:00 PM (Morning Slot)";
  const lower = raw.toLowerCase();

  if (lower.includes("06:00") || lower.includes("6 am") || lower.includes("sunrise")) {
    return "06:00 AM - 09:00 AM (Sunrise Slot)";
  }
  if (lower.includes("09:00") || lower.includes("9 am") || lower.includes("morning")) {
    return "09:00 AM - 12:00 PM (Morning Slot)";
  }
  if (lower.includes("12:00") || lower.includes("12 pm") || lower.includes("afternoon") || lower.includes("01:00") || lower.includes("02:00")) {
    return "12:00 PM - 03:00 PM (Afternoon Slot)";
  }
  if (lower.includes("03:00") || lower.includes("3 pm") || lower.includes("04:00") || lower.includes("05:00") || lower.includes("06:00 pm") || lower.includes("sunset") || lower.includes("evening")) {
    return "03:00 PM - 06:00 PM (Sunset Slot)";
  }

  return raw.includes("Slot") ? raw : `${raw} (Morning Slot)`;
}

/**
 * Normalizes any natural or ISO date into strict YYYY-MM-DD.
 */
export function normalizeDate(raw?: string | null): string {
  if (!raw) {
    return new Date(Date.now() + 86400000).toISOString().split("T")[0];
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    return raw.trim();
  }

  const clean = raw.trim().toLowerCase();
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    january: "01", february: "02", march: "03", april: "04",
    june: "06", july: "07", august: "08", september: "09",
    october: "10", november: "11", december: "12",
  };

  // e.g. "21st october 2026", "21 oct", "21st october"
  const dayMonthMatch = clean.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?/);
  if (dayMonthMatch) {
    const day = dayMonthMatch[1].padStart(2, "0");
    const mStr = dayMonthMatch[2];
    const month = months[mStr];
    const year = dayMonthMatch[3] || "2026";
    if (month) return `${year}-${month}-${day}`;
  }

  // e.g. "october 21, 2026", "oct 21"
  const monthDayMatch = clean.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/);
  if (monthDayMatch) {
    const mStr = monthDayMatch[1];
    const day = monthDayMatch[2].padStart(2, "0");
    const month = months[mStr];
    const year = monthDayMatch[3] || "2026";
    if (month) return `${year}-${month}-${day}`;
  }

  // Try standard Date parse
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return new Date(Date.now() + 86400000).toISOString().split("T")[0];
}

/**
 * Normalizes any monument name or slug into a clean lowercase slug.
 */
export function normalizeSlug(raw?: string | null): string {
  if (!raw) return "taj-mahal";
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-");
}

/**
 * Extracts a complete booking draft from an AI assistant message text.
 * Checks for both checkout URLs and structured markdown booking summaries.
 */
export function extractBookingFromText(text: string): BookingDraft | null {
  if (!text) return null;

  // 1. Look for explicit /checkout query URL in the text
  const checkoutUrlMatch = text.match(/\/checkout\?([^\s)\]]+)/);
  if (checkoutUrlMatch) {
    try {
      const qs = checkoutUrlMatch[1];
      const params = new URLSearchParams(qs);

      const rawSite =
        params.get("site") ||
        params.get("monument") ||
        params.get("place") ||
        params.get("siteSlug") ||
        params.get("slug");

      const rawParty =
        params.get("partySize") ||
        params.get("members") ||
        params.get("visitors") ||
        params.get("tickets") ||
        params.get("count");

      const rawDate = params.get("date") || params.get("visitDate");
      const rawSlot = params.get("slot") || params.get("time");
      const rawGuide = params.get("guide") || params.get("guideName") || params.get("guideId");

      if (rawSite) {
        const siteSlug = normalizeSlug(rawSite);
        const siteName = siteSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        const partySize = rawParty ? Math.max(1, parseInt(rawParty, 10)) : 2;
        const visitDate = normalizeDate(rawDate);
        const visitSlot = normalizeSlot(rawSlot);
        const guideName = rawGuide && rawGuide !== "none" ? decodeURIComponent(rawGuide) : undefined;

        return {
          siteSlug,
          siteName,
          partySize,
          visitDate,
          visitSlot,
          guideName,
          guideId: guideName,
        };
      }
    } catch {}
  }

  // 2. Structured bullet summary check
  // e.g. - **Monument:** Statue of Unity
  const monumentMatch = text.match(/(?:monument|स्मारक|place|site)[:\s*]+([^\n\r*]+)/i);
  const visitorsMatch = text.match(/(?:visitors?|members?|सदस्य|tickets?)[:\s*]+(\d+)/i) ||
                        text.match(/(\d+)\s*(?:members?|visitors?|tickets?)/i);
  const dateMatch = text.match(/(?:date|तारीख|दिनांक)[:\s*]+([^\n\r*]+)/i);
  const slotMatch = text.match(/(?:time\s*slot|time|समय)[:\s*]+([^\n\r*]+)/i);
  const guideMatch = text.match(/(?:guide|गाइड)[:\s*]+([^\n\r*(]+)/i);
  const totalMatch = text.match(/(?:total|estimated\s*total|कुल)[:\s*]+₹?\s*([\d,]+)/i);

  if (monumentMatch) {
    const rawName = monumentMatch[1].replace(/[*\-_#]/g, "").trim();
    if (rawName.length > 2) {
      const siteSlug = normalizeSlug(rawName);
      const siteName = rawName;
      const partySize = visitorsMatch ? Math.max(1, parseInt(visitorsMatch[1], 10)) : 2;
      const visitDate = normalizeDate(dateMatch ? dateMatch[1].replace(/[*\-_]/g, "").trim() : null);
      const visitSlot = normalizeSlot(slotMatch ? slotMatch[1].replace(/[*\-_]/g, "").trim() : null);
      const guideName = guideMatch ? guideMatch[1].replace(/[*\-_]/g, "").trim() : undefined;
      const totalINR = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : undefined;

      return {
        siteSlug,
        siteName,
        partySize,
        visitDate,
        visitSlot,
        guideName: guideName && !guideName.toLowerCase().includes("none") && !guideName.toLowerCase().includes("self") ? guideName : undefined,
        guideId: guideName,
        totalINR,
      };
    }
  }

  return null;
}

/**
 * Saves the draft booking synchronously across all storage layers and fires an update event.
 */
export function saveBookingDraft(draft: BookingDraft): void {
  if (typeof window === "undefined") return;

  try {
    const jsonStr = JSON.stringify(draft);
    localStorage.setItem(STORAGE_KEY_CHAT_BOOKING, jsonStr);
    localStorage.setItem(STORAGE_KEY_PENDING_DRAFT, jsonStr);
    sessionStorage.setItem(STORAGE_KEY_PENDING_DRAFT, jsonStr);

    window.dispatchEvent(new CustomEvent("heritage-chat-booking-updated", { detail: draft }));
  } catch (err) {
    console.warn("Failed to persist booking draft:", err);
  }
}

/**
 * Retrieves the most recent booking draft from localStorage or sessionStorage.
 */
export function getSavedBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem(STORAGE_KEY_CHAT_BOOKING) ||
      sessionStorage.getItem(STORAGE_KEY_PENDING_DRAFT) ||
      localStorage.getItem(STORAGE_KEY_PENDING_DRAFT);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.siteSlug || parsed.siteName)) {
        return {
          ...parsed,
          siteSlug: normalizeSlug(parsed.siteSlug || parsed.siteName),
          partySize: parsed.partySize || 2,
          visitDate: normalizeDate(parsed.visitDate),
          visitSlot: normalizeSlot(parsed.visitSlot),
        };
      }
    }
  } catch {}

  return null;
}

/**
 * Formats a clean checkout URL with all query parameters from a draft.
 */
export function formatCheckoutUrl(draft: BookingDraft): string {
  const params = new URLSearchParams();
  params.set("site", draft.siteSlug);
  params.set("partySize", String(draft.partySize || 2));
  params.set("date", normalizeDate(draft.visitDate));
  params.set("slot", normalizeSlot(draft.visitSlot));

  if (draft.guideName && draft.guideName !== "none") {
    params.set("guide", draft.guideName);
  }

  return `/checkout?${params.toString()}`;
}

/**
 * Formats an auth redirect URL that takes the user back to checkout with all parameters intact.
 */
export function formatAuthRedirectUrl(mode: "login" | "signup", draft: BookingDraft): string {
  const checkoutUrl = formatCheckoutUrl(draft);
  return `/${mode}?redirect=${encodeURIComponent(checkoutUrl)}&from=chat&siteName=${encodeURIComponent(draft.siteName || draft.siteSlug)}`;
}
