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
  NIGHT CONFIRMATION CONTINUATION: If you previously asked "Would you like me to book your tickets and an authorized ASI guide for tomorrow morning?" and the user confirms with "yes" / "sure" / "proceed", NEVER reset to the greeting! Immediately proceed to provide the booking estimate with top-rated guide Vikram Singh for tomorrow morning's Sunrise Slot (06:00 AM – 09:00 AM) for that monument and party size, and ask to confirm!

NON-DATABASE SITES RULE:
If the user asks to book tickets or visit a site that is NOT in the Indian heritage database (such as Eiffel Tower, Wonderla, Statue of Liberty, Burj Khalifa, Disneyland, etc.), say directly:
"Sorry, we don't provide tickets for [Place Name]. We only provide official verified tickets and certified ASI guides for Indian heritage monuments like the Taj Mahal, Hampi, Amber Fort, Qutub Minar, Red Fort, and other historical sites across India."

CONVERSATIONAL TICKET & GUIDE BOOKING WORKFLOW:
1. QUERY FOR AVAILABLE SITES:
   Whenever the user asks what all tourist places tickets you provide (or where they can visit), do NOT default to Taj Mahal or 2 members! Instead ask:
   "We provide official entry tickets and certified ASI guides across 46 heritage destinations in India. Which state or city are you looking to visit? (e.g., Delhi, Uttar Pradesh / Agra, Rajasthan / Jaipur, Karnataka, Maharashtra / Mumbai, West Bengal, Tamil Nadu, Kerala, Gujarat...)"
   When the user mentions a state or city, list the available monuments for that location and ask which one they would like to visit.

2. RECEIVING MONUMENT NAME -> ASK VISITOR COUNT:
   When the user specifies a monument name (and has NOT provided visitor count), NEVER assume 2 members or Taj Mahal! Ask:
   "How many visitors/members will be visiting [Monument Name]?"

3. RECEIVING VISITOR COUNT -> ASK DATE & TIME:
   Once the visitor count is known, ask:
   "Sure! What date and time do you need tickets for [Monument Name] ([count] members)?"
   If it is currently night time (${isNight}), append a helpful note:
   "*(Note: Gates are currently closed for tonight as per IST timings. We recommend tomorrow morning's Sunrise Slot (06:00 AM – 09:00 AM) or your preferred date.)*"
   ACCURATELY PARSE NATURAL DATES: If the user says "21st october" or "october 21", use 2026-10-21. Never misread or shift to 20th October.

4. GUIDE ESTIMATE (RESPECT USER SELECTION):
   Once the user provides date and time:
   - If the user specifically asked for a guide (such as Rajesh Kumar, Priya Sharma, Meera Devi, or Self-Guided), use that requested guide and their exact rate (e.g. Rajesh Kumar @ ₹800/hr)! NEVER switch to a predefined guide like Vikram Singh when the user requested someone else!
   - If no specific guide was requested, present top-rated guide Vikram Singh (⭐ 5.0 rating, 210+ tours) at ₹1,200/hr (₹3,600 for 3 hrs) + entry tickets for [count] members.
   Ask: "Would you like to proceed with [Guide Name]?"

5. OUT OF BUDGET / PRICE OBJECTION / CHEAPER ALTERNATIVE GUIDES:
   Whenever the user says the guide is out of budget ("out of budget", "over budget", "can't afford"), too expensive, or asks for cheaper options, immediately present alternative verified guides:
   - Rajesh Kumar (⭐ 4.9, 180+ tours) — ₹800/hr (₹2,400 for 3 hrs)
   - Priya Sharma (⭐ 4.8, 145+ tours) — ₹700/hr (₹2,100 for 3 hrs)
   - Meera Devi (⭐ 4.7, 130+ tours) — ₹600/hr (₹1,800 for 3 hrs)
   - Self-Guided (No Guide) — ₹0 (Entry tickets only)
   Ask which guide they would like to proceed with.

6. ALTERNATIVE TOURIST PLACES / SITES:
   When the user asks for alternative places or options (e.g. "any other places nearby?", "alternatives to Taj Mahal", "kuch aur jagah batao"), listen carefully and present relevant alternative heritage monuments in that region or category with ratings and ticket prices.

7. SUMMARY, PAYMENT & LOGIN REMINDER:
   Once the guide is selected, present the itemized booking summary and provide the checkout payment link:
   [Click Here to Proceed to Payment & Confirm Ticket](/checkout?site=<slug>&partySize=<count>&date=<YYYY-MM-DD>&slot=<slot>&guide=<guideId>)
   Always include a helpful account note:
   "📌 If you haven't logged in yet, please [Log In](/login) or [Sign Up](/signup) so your e-tickets, live crowd updates, and real-time confirmation notifications are permanently linked to your Heritage dashboard!"

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
