import prisma from "../../lib/prisma.js";
import { getLiveCrowd } from "../crowd.js";

export function detectLanguage(text: string, defaultLang = "en"): { code: string; name: string } {
  // Check Devanagari script for Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    return { code: "hi", name: "Hindi" };
  }
  // Check common Spanish words or accents
  if (
    /[áéíóúüñ¿¡]/i.test(text) ||
    /\b(hola|por favor|cuanto|cuesta|guia|donde|gracias|buenos|tardes|noches)\b/i.test(text)
  ) {
    return { code: "es", name: "Spanish" };
  }
  if (defaultLang === "hi") return { code: "hi", name: "Hindi" };
  if (defaultLang === "es") return { code: "es", name: "Spanish" };
  return { code: "en", name: "English" };
}

export async function buildGroundingContext(userPrompt: string): Promise<string> {
  const promptLower = userPrompt.toLowerCase();

  // Load all sites and guides for matching
  const [allSites, allGuides] = await Promise.all([
    prisma.site.findMany({ include: { content: true } }),
    prisma.guide.findMany({ where: { licenseStatus: "VERIFIED" } }),
  ]);

  // Identify mentioned sites or query keywords
  const matchedSites = allSites.filter(
    (s) =>
      promptLower.includes(s.name.toLowerCase()) ||
      promptLower.includes(s.slug.toLowerCase()) ||
      promptLower.includes(s.city.toLowerCase()) ||
      promptLower.includes(s.state.toLowerCase())
  );

  const relevantSites = matchedSites.length > 0 ? matchedSites : allSites.slice(0, 5);

  const siteContexts = await Promise.all(
    relevantSites.map(async (s) => {
      const crowd = await getLiveCrowd(s.id, s.slug);
      const meta = [
        `Entry Fee: ₹${s.entryFeeINR}`,
        `Hours: ${s.openingHours}`,
        `Current Crowd: ${crowd.level} (${crowd.percent}%)`,
        `Rating: ${(s as any).googleRating ?? 4.5}★`,
        (s as any).bestTime ? `Best Time: ${(s as any).bestTime}` : null,
        (s as any).weeklyOff && (s as any).weeklyOff !== "Open All Days" ? `Weekly Off: ${(s as any).weeklyOff}` : null,
      ].filter(Boolean).join(" | ");
      return `- ${s.name} (${s.city}, ${s.state}, ${(s as any).zone ?? ""}) | Category: ${s.category} | ${meta}`;
    })
  );

  const guideContexts = allGuides.slice(0, 6).map((g) => {
    const langs = JSON.parse(g.languages || "[]").join(", ");
    return `- ${g.name} (License: ${g.licenseId}, VERIFIED ASI Guide) | Experience: ${g.experienceYears} yrs | Languages: ${langs} | Rate: ₹${g.ratePerHourINR}/hr`;
  });

  return `
[AUTHENTIC DATABASE CONTEXT - USE ONLY THESE FACTS FOR PRICES, CROWDS, AND LICENSES]
HERITAGE SITES:
${siteContexts.join("\n")}

VERIFIED ASI GUIDES:
${guideContexts.join("\n")}
[END DATABASE CONTEXT]
`.trim();
}

export function buildSystemPrompt(groundingContext: string, detectedLang: { code: string; name: string }): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  const hour = ist.getHours();
  const isNight = hour >= 18 || hour < 6;
  const tomorrow = new Date(ist.getTime() + 86400000).toISOString().split("T")[0];

  return `You are the official AI-Tourist Assistant for Indian Heritage Sites (Heritage India).
You provide friendly, cinematic, and accurate guidance for exploring historical monuments, forts, temples, and palaces.

CURRENT TIME & CLOSING HOURS CONTEXT:
- Indian Standard Time (IST): ${ist.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.
- Monument Visiting Hours: Strictly sunrise (approx 06:00 AM) to sunset (approx 06:00 PM).
- Is Currently Night/Closed: ${isNight ? "YES (CLOSED FOR THE NIGHT)" : "NO (OPEN)"}.
- Tomorrow's Date: ${tomorrow}.
- CRITICAL NIGHT RULE: When it is night time (${isNight}), and the user asks if this is the best time to see the place or asks about visiting now, you MUST explicitly state:
  "Now it is closed. Please book for tomorrow's visit in advance."
  Explain that monuments close at sunset (6:00 PM) and reopen at sunrise (6:00 AM). Recommend the Sunrise Slot (06:00 AM – 09:00 AM) tomorrow for golden morning light, cool weather, and minimal crowds.

CONVERSATIONAL TICKET & GUIDE BOOKING WORKFLOW:
When the user indicates they want to book tickets (e.g. "book a ticket for 2 members for Taj Mahal"):
1. STEP 1 (Ask Date & Time): If the visit date and entry time slot are not yet provided, prompt the user for their preferred Visit Date and Entry Time Slot (Sunrise 6-9 AM, Morning 9-12 PM, Afternoon 12-3 PM, Sunset 3-6 PM).
2. STEP 2 (Ask for Guide): Once the user responds with the date and time, ask which guide they would like to book from the following available verified ASI guides with prices, or if they prefer Self-Guided (₹0):
   - Rajesh Kumar (ASI-AGR-001) – ₹800/hr
   - Priya Sharma (ASI-AGR-002) – ₹700/hr
   - Vikram Singh (ASI-AGR-005) – ₹1,200/hr
   - Arun Nair (ASI-AGR-003) – ₹1,000/hr
   - Self-Guided (No Guide) – ₹0
3. STEP 3 (Summary & Payment): Once the guide is selected, present the itemized booking summary and provide the checkout payment link:
   [Click Here to Proceed to Payment & Confirm Ticket](/checkout?site=<slug>&partySize=<count>&date=<YYYY-MM-DD>&slot=<slot>&guide=<guideId>)
   Confirm that upon completing payment, official e-tickets are generated immediately.

CRITICAL INTEGRITY RULES:
1. Answer ONLY using the provided DATABASE CONTEXT for all facts about entry fees, opening hours, current crowd levels, and guide verification status.
2. If the user asks for a price, crowd, or guide that is NOT in the database context, explicitly state that you do not have verified official records for that exact detail instead of inventing or estimating.
3. Only recommend VERIFIED ASI licensed guides. Never recommend or validate unverified guides.
4. Respect the user's budget if mentioned. Highlight quiet/less-crowded alternatives when a site is busy.
5. Keep your tone editorial, respectful, knowledgeable, and concise.

MULTILINGUAL RULE:
You MUST respond in ${detectedLang.name} (${detectedLang.code}). Match the exact language of the user's request.

${groundingContext}
`.trim();
}
