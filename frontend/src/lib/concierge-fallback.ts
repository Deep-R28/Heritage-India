/**
 * Intelligent concierge intelligence engine for Indian Heritage Sites.
 * Provides grounded, richly-formatted answers with live crowd telemetry,
 * verified ASI guides, entry fees, and opening hours across English, Hinglish,
 * Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, and Spanish.
 *
 * Supports multi-turn conversational booking flows:
 * - State/City discovery ("what all tourist places tickets you provide")
 * - Dynamic visitor inquiry without defaulting to Taj Mahal or 2 members
 * - Accurate natural language date parsing ("21st october" -> 2026-10-21)
 * - User-specified guide persistence (e.g. "under Rajesh Kumar as guide")
 * - Economical alternative guides when user says "out of budget" / "expensive"
 * - Non-database site detection
 * - Night-time closed hours guidance
 * - Real alternative options for tourist sites and guides
 * - Login/Signup prompt prior to checkout
 */
import nearbySitesRaw from "@/data/nearby-sites.json";

export interface CatalogSite {
  id: string;
  slug: string;
  name: string;
  category: string;
  region: string;
  priceInr: number;
  openHours: string;
  summary: string;
  history?: string;
  crowdPercent?: number;
  zone?: string;
  googleRating?: number;
}

const sites = nearbySitesRaw as CatalogSite[];

export interface VerifiedGuideInfo {
  id: string;
  name: string;
  license: string;
  rate: number;
  languages: string;
  rating: number;
  tours: number;
}

export const VERIFIED_GUIDES: VerifiedGuideInfo[] = [
  { id: "G-AGR-05", name: "Vikram Singh", license: "ASI-AGR-005", rate: 1200, languages: "English, Hindi, French, Spanish", rating: 5.0, tours: 210 },
  { id: "G-AGR-01", name: "Rajesh Kumar", license: "ASI-AGR-001", rate: 800, languages: "English, Hindi, Urdu", rating: 4.9, tours: 180 },
  { id: "G-AGR-02", name: "Priya Sharma", license: "ASI-AGR-002", rate: 700, languages: "English, Hindi, Sanskrit", rating: 4.8, tours: 145 },
  { id: "G-AGR-03", name: "Arun Nair", license: "ASI-AGR-003", rate: 1000, languages: "English, Hindi, Tamil, Malayalam", rating: 4.9, tours: 160 },
  { id: "G-DEL-04", name: "Meera Devi", license: "ASI-DEL-004", rate: 600, languages: "English, Hindi, Rajasthani, Gujarati", rating: 4.7, tours: 130 },
  { id: "none", name: "Self-Guided (No Guide)", license: "N/A", rate: 0, languages: "Self-Paced Exploration", rating: 5.0, tours: 0 },
];

const SITE_SCRIPT_ALIASES: Record<string, string[]> = {
  "taj-mahal": [
    "ताजमहल", "ताज महल", "তাজমহল", "தாஜ்மஹால்", "తాజ్ మహల్",
    "ತಾಜ್ ಮಹಲ್", "તાજ મહેલ", "ਤਾਜ ਮਹਿਲ", "تاج محل", "താജ് മഹൽ"
  ],
  "hampi": [
    "हम्पी", "হাম্পি", "ஹம்பி", "హంపి", "ಹಂಪಿ", "હમ્પી", "ਹੰਪੀ", "ہمپی"
  ],
  "amber-fort": [
    "आमेर किला", "আমেৰ দুৰ্গ", "ஆம்பர் கோட்டை", "అంబర్ కోట", "ಆಂಬರ್ ಕೋಟೆ", "આમેર કિલ્લો"
  ],
  "qutub-minar": [
    "कुतुब मीनार", "কুতুব মিনার", "குதுப் மினார்", "కుతుబ్ మినార్", "ಕುತುಬ್ ಮಿನಾರ್"
  ],
  "red-fort": [
    "लाल किला", "लाल केल्ला", "செங்கோட்டை", "ఎర్ర కోట", "ಕೆಂಪು ಕೋಟೆ", "લાલ કિલ્લો", "ਲਾਲ ਕਿਲਾ", "لال قلعہ"
  ],
  "hawa-mahal": [
    "हवा महल", "হাওয়া মহল", "ஹவா மஹால்", "హవా మహల్", "ಹವಾ ಮಹಲ್", "હવા મહેલ", "ਹਵਾ ਮਹਿਲ", "ہوا محل"
  ],
  "mysore-palace": [
    "मैसूर पैलेस", "মহীশূর প্রাসাদ", "மைசூர் அரண்மனை", "మైసూర్ ప్యాలెస్", "ಮೈಸೂರು ಅರಮನೆ", "મૈસૂર મહેલ"
  ],
  "chand-baori": [
    "चांद बावड़ी", "চাঁদ বাওরি", "சந்த் பௌரி", "చాంద్ బావోరి", "ಚಾಂದ್ ಬಾವೊರಿ"
  ],
  "kerala-backwaters": [
    "केरल बैकवाटर", "কেরালা ব্যাকওয়াটার", "கேரளா பேக்வாட்டர்ஸ்", "కేరళ బ్యాక్‌వాటర్స్", "കേരള ബാക്ക്‌വാട്ടേഴ്‌സ്"
  ],
};

// Known regions / states / cities in our database
const KNOWN_REGIONS: Record<string, string[]> = {
  "delhi": ["delhi", "new delhi", "नई दिल्ली", "दिल्ली"],
  "uttar pradesh": ["uttar pradesh", "up", "agra", "varanasi", "ayodhya", "उत्तर प्रदेश", "आगरा", "वाराणसी", "अयोध्या"],
  "agra": ["agra", "आगरा"],
  "varanasi": ["varanasi", "kashi", "banaras", "वाराणसी", "काशी", "बनारस"],
  "ayodhya": ["ayodhya", "अयोध्या"],
  "karnataka": ["karnataka", "hampi", "mysuru", "mysore", "bengaluru", "bangalore", "कर्नाटक", "हम्पी", "मैसूर", "बेंगलुरु"],
  "rajasthan": ["rajasthan", "jaipur", "udaipur", "jodhpur", "abhaneri", "राजस्थान", "जयपुर", "उदयपुर", "जोधपुर"],
  "maharashtra": ["maharashtra", "mumbai", "aurangabad", "ajanta", "ellora", "महाराष्ट्र", "मुंबई", "औरंगाबाद"],
  "west bengal": ["west bengal", "kolkata", "calcutta", "sundarbans", "पश्चिम बंगाल", "कोलकाता"],
  "tamil nadu": ["tamil nadu", "madurai", "mahabalipuram", "chennai", "तमिलनाडु", "मदुरै", "महाबलीपुरम"],
  "telangana": ["telangana", "hyderabad", "तेलंगाना", "हैदराबाद"],
  "punjab": ["punjab", "amritsar", "पंजाब", "अमृतसर"],
  "odisha": ["odisha", "orissa", "puri", "konark", "ओडिशा", "पुरी", "कोणार्क"],
  "madhya pradesh": ["madhya pradesh", "mp", "khajuraho", "sanchi", "mandu", "मध्य प्रदेश", "खजुराहो", "सांची", "मांडू"],
  "gujarat": ["gujarat", "kutch", "veraval", "somnath", "kevadiya", "गुजरात", "कच्छ", "सोमनाथ"],
  "kerala": ["kerala", "alleppey", "thiruvananthapuram", "trivandrum", "केरल"],
  "goa": ["goa", "गोवा"],
  "uttarakhand": ["uttarakhand", "rishikesh", "उत्तराखंड", "ऋषिकेश"],
  "andhra pradesh": ["andhra pradesh", "tirupati", "आंध्र प्रदेश", "तिरुपति"],
  "assam": ["assam", "kaziranga", "असम", "काजीरंगा"],
  "arunachal pradesh": ["arunachal pradesh", "tawang", "अरुणाचल प्रदेश", "तवांग"],
  "meghalaya": ["meghalaya", "cherrapunji", "मेघालय", "चेरापूंजी"],
};

export interface BookingSessionState {
  step:
    | "idle"
    | "awaiting_state_or_city"
    | "awaiting_monument_choice"
    | "awaiting_party_size"
    | "awaiting_datetime"
    | "awaiting_night_booking_confirmation"
    | "offered_best_guide"
    | "awaiting_alternative_guide"
    | "completed";
  selectedRegion?: string;
  siteSlug?: string;
  siteName?: string;
  partySize?: number;
  visitDate?: string;
  visitSlot?: string;
  guideId?: string;
  guideName?: string;
  guideRate?: number;
  isSelfGuided?: boolean;
  lang?: string;
}

const sessionStates = new Map<string, BookingSessionState>();

export function getISTContext() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  // Indian Standard Time is UTC + 5:30
  const ist = new Date(utc + 3600000 * 5.5);
  const hour = ist.getHours();
  const minute = ist.getMinutes();
  const dayOfWeek = ist.getDay(); // 0: Sun, 5: Fri
  const isNight = hour >= 18 || hour < 6;
  const tomorrow = new Date(ist.getTime() + 86400000);
  const todayStr = ist.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  return { hour, minute, dayOfWeek, isNight, todayStr, tomorrowStr };
}

export function isHinglish(text: string): boolean {
  const lower = text.toLowerCase();
  const hinglishWords = [
    "kya", "ye", "yeh", "yah", "hai", "hain", "vakt", "waqt", "jaane", "jane", "ke", "liye",
    "batao", "kahan", "kaha", "kaun", "kitna", "kitne", "kaise", "bheed", "shukriya",
    "shandar", "aaj", "kal", "parso", "subah", "shaam", "dikhaye", "milega", "chahiye",
    "karun", "karein", "ghoomne", "dekhne", "kaisi", "accha", "achha", "sahi", "safar",
    "imarat", "jagah", "bhookh", "hoga", "hogi", "bataiye", "jaana", "jana", "tajmahal",
    "kardo", "karo", "karna", "tikkat", "bina", "mehenga", "zyada", "kripya", "vikalp", "dusra", "paise"
  ];
  return hinglishWords.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower));
}

export function detectQueryLanguage(text: string, defaultLang = "en"): string {
  const lower = text.toLowerCase();
  if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta"; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return "te"; // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn"; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml"; // Malayalam
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu"; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa"; // Punjabi
  if (/[\u0600-\u06FF]/.test(text)) return "ur"; // Urdu
  if (/[\u0900-\u097F]/.test(text)) {
    if (/\b(कधी|जावे|आहे|गर्दी|तिकीट|पाहू)\b/.test(lower)) return "mr"; // Marathi
    return "hi"; // Hindi
  }
  if (/\b(hola|buenos|dias|gracias|cuando|donde|precio|entrada|horario|visitar|guia|monumento|reserva)\b/i.test(lower)) {
    return "es";
  }
  if (isHinglish(text)) return "hinglish";
  if (["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur", "es"].includes(defaultLang)) {
    return defaultLang;
  }
  return "en";
}

function getLiveCrowdTelemetry() {
  const ist = getISTContext();
  if (ist.isNight) {
    return { level: "CLOSED", percent: 0, goodTimeToVisit: false };
  }
  if (ist.hour >= 11 && ist.hour <= 15) {
    return { level: "MODERATE", percent: 46, goodTimeToVisit: true };
  }
  return { level: "LOW", percent: 18, goodTimeToVisit: true };
}

const MONTH_MAP: Record<string, number> = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

/**
 * Robust date parser supporting natural expressions like "21st october", "october 21", "21/10", "tomorrow", etc.
 */
export function parseDateFromQuery(query: string, ist: ReturnType<typeof getISTContext>): string {
  const q = query.toLowerCase();

  // 1. Explicit ISO YYYY-MM-DD
  const isoMatch = q.match(/\b(202\d-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  const currentYear = 2026;

  // 2. Pattern: "21st october", "21 october", "21st of oct"
  const dayMonthMatch = q.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/i);
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const mName = dayMonthMatch[2].toLowerCase();
    const month = MONTH_MAP[mName] || 10;
    const year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3], 10) : currentYear;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // 3. Pattern: "october 21st", "oct 21", "october 21"
  const monthDayMatch = q.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b/i);
  if (monthDayMatch) {
    const mName = monthDayMatch[1].toLowerCase();
    const month = MONTH_MAP[mName] || 10;
    const day = parseInt(monthDayMatch[2], 10);
    const year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : currentYear;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // 4. Pattern: 21/10/2026 or 21-10-2026 or 21/10
  const slashMatch = q.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?\b/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10);
    const year = slashMatch[3] ? parseInt(slashMatch[3], 10) : currentYear;
    if (day <= 31 && month <= 12) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  // 5. Relative dates
  if (q.includes("today") || q.includes("aaj")) return ist.todayStr;
  if (q.includes("tomorrow") || q.includes("kal")) return ist.tomorrowStr;
  if (q.includes("parso") || q.includes("day after tomorrow")) {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split("T")[0];
  }

  return ist.tomorrowStr;
}

export function parseSlotFromQuery(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("sunrise") || q.includes("6am") || q.includes("7am") || q.includes("06:00")) {
    return "06:00 AM (Sunrise Slot)";
  }
  if (q.includes("afternoon") || q.includes("dopahar") || q.includes("12pm") || q.includes("1pm") || q.includes("2pm") || q.includes("12:00") || q.includes("14:00")) {
    return "12:00 PM (Afternoon Slot)";
  }
  if (q.includes("sunset") || q.includes("shaam") || q.includes("evening") || q.includes("3pm") || q.includes("4pm") || q.includes("5pm") || q.includes("15:00") || q.includes("16:00") || q.includes("17:00")) {
    return "03:00 PM (Sunset Slot)";
  }
  if (q.includes("10am") || q.includes("10 am") || q.includes("10:00") || q.includes("morning") || q.includes("subah") || q.includes("9am") || q.includes("9 am")) {
    return "09:00 AM (Morning Slot)";
  }
  return "09:00 AM (Morning Slot)";
}

/**
 * Extracts a guide requested by name or keyword
 */
export function extractRequestedGuide(query: string): VerifiedGuideInfo | null {
  const lower = query.toLowerCase();
  if (lower.includes("rajesh kumar") || lower.includes("rajesh") || /\b(?:option\s*1|#1|first\s+guide)\b/i.test(lower)) {
    return VERIFIED_GUIDES.find((g) => g.id === "G-AGR-01") || null;
  }
  if (lower.includes("priya sharma") || lower.includes("priya") || /\b(?:option\s*2|#2|second\s+guide)\b/i.test(lower)) {
    return VERIFIED_GUIDES.find((g) => g.id === "G-AGR-02") || null;
  }
  if (lower.includes("meera devi") || lower.includes("meera") || /\b(?:option\s*3|#3|third\s+guide)\b/i.test(lower)) {
    return VERIFIED_GUIDES.find((g) => g.id === "G-DEL-04") || null;
  }
  if (lower.includes("arun nair") || lower.includes("arun")) {
    return VERIFIED_GUIDES.find((g) => g.id === "G-AGR-03") || null;
  }
  if (lower.includes("vikram singh") || lower.includes("vikram")) {
    return VERIFIED_GUIDES.find((g) => g.id === "G-AGR-05") || null;
  }
  if (
    lower.includes("self") ||
    lower.includes("no guide") ||
    lower.includes("without guide") ||
    lower.includes("bina guide") ||
    /\b(?:option\s*4|#4|fourth|bina\s*guide)\b/i.test(lower)
  ) {
    return VERIFIED_GUIDES.find((g) => g.id === "none") || null;
  }
  return null;
}

export function isDateMentionedInQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(q) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})/i.test(q) ||
    /\b(tomorrow|kal|today|aaj|parso|202\d-\d{2}-\d{2})\b/i.test(q) ||
    /\b\d{1,2}[\/\-]\d{1,2}\b/.test(q)
  );
}

/**
 * Extracts a target place name if user requests a booking for a specific site.
 */
function extractRequestedPlaceName(query: string): string | null {
  const clean = query.trim();

  // Known non-database / non-heritage tourist attractions
  const nonHeritageAttractions = [
    "eiffel tower", "wonderla", "statue of liberty", "burj khalifa", "disneyland",
    "london eye", "colosseum", "universal studios", "times square", "louvre",
    "machu picchu", "pyramids", "great wall", "santorini", "grand canyon",
    "disney", "imagica", "essel world", "snow kingdom", "water park"
  ];
  for (const nonH of nonHeritageAttractions) {
    if (clean.toLowerCase().includes(nonH)) {
      return nonH.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
  }

  // Pattern: "book ticket for <Place>"
  const m1 = clean.match(/(?:book|reserve)\s+(?:a\s+)?(?:ticket|tickets|entry|pass)?\s*(?:for\s+\d+\s+(?:members?|people|persons?|tickets?))?\s*(?:for|to|at)\s+([^,?.!]+)/i);
  if (m1 && m1[1]) {
    const candidate = m1[1].replace(/\b(for\s+\d+|tomorrow|today|kal|aaj|at\s+\d+|on\s+\w+).*/i, "").trim();
    if (candidate.length > 2 && !/\b(me|us|tickets?|members?|today|tomorrow)\b/i.test(candidate)) {
      return candidate;
    }
  }

  // Pattern: "<Place> ke liye ticket"
  const m2 = clean.match(/(.+?)\s+ke\s+liye\s+ticket/i);
  if (m2 && m2[1]) {
    const candidate = m2[1].replace(/\b(mujhe|humein|hume|please|zara)\b/i, "").trim();
    if (candidate.length > 2) return candidate;
  }

  return null;
}

/**
 * Checks if a place name matches any supported monument in database
 */
function isKnownMonument(placeName: string): boolean {
  const p = placeName.toLowerCase();
  return sites.some((site) => {
    const sName = site.name.toLowerCase().replace("the ", "");
    const sSlug = site.slug.toLowerCase().replace(/-/g, " ");
    const aliases = SITE_SCRIPT_ALIASES[site.slug] || [];
    return (
      p.includes(sName) ||
      sName.includes(p) ||
      p.includes(sSlug) ||
      aliases.some((a) => p.includes(a.toLowerCase()))
    );
  });
}

/**
 * Finds monuments matching a state or city name
 */
function findSitesByRegion(regionInput: string): CatalogSite[] {
  const input = regionInput.toLowerCase().trim();
  return sites.filter((s) => {
    const rLower = s.region.toLowerCase();
    return rLower.includes(input);
  });
}

/**
 * Detects if user input contains a known region/state/city
 */
function matchKnownRegion(query: string): string | null {
  const q = query.toLowerCase();
  for (const [canonicalRegion, aliases] of Object.entries(KNOWN_REGIONS)) {
    for (const alias of aliases) {
      if (new RegExp(`\\b${alias}\\b`, "i").test(q)) {
        return canonicalRegion;
      }
    }
  }
  return null;
}

/**
 * Matches a specific monument from query
 */
function matchSpecificMonument(query: string): CatalogSite | null {
  const q = query.toLowerCase();
  const cleanQ = q.replace(/[^a-z0-9]/g, "");

  return (
    sites.find((site) => {
      const sName = site.name.toLowerCase().replace("the ", "");
      const sSlug = site.slug.toLowerCase().replace(/-/g, " ");
      const cleanName = sName.replace(/[^a-z0-9]/g, "");
      const cleanSlug = sSlug.replace(/[^a-z0-9]/g, "");
      const aliases = SITE_SCRIPT_ALIASES[site.slug] || [];

      if (aliases.some((a) => q.includes(a.toLowerCase()))) return true;
      if (q.includes(sName) || q.includes(sSlug)) return true;
      if (cleanQ.includes(cleanName) && cleanName.length > 3) return true;
      if (cleanQ.includes(cleanSlug) && cleanSlug.length > 3) return true;
      return false;
    }) || null
  );
}

/**
 * Checks if the last message from the assistant was a night closure prompt offering
 * to book tickets and a guide for tomorrow morning.
 */
function lastAssistantQueryWasNightClosure(
  history?: Array<{ role: string; text?: string; content?: string }>
): boolean {
  if (!history || history.length === 0) return false;
  const lastAssistant =
    [...history].reverse().find((h) => h.role === "assistant")?.text ||
    [...history].reverse().find((h) => h.role === "assistant")?.content ||
    "";
  const lower = lastAssistant.toLowerCase();
  return (
    lower.includes("book your tickets and an authorized asi guide for tomorrow morning") ||
    lower.includes("tickets aur guide advance mein book kar doon") ||
    lower.includes("अग्रिम टिकट और अधिकृत गाइड बुक करना चाहते हैं") ||
    lower.includes("book for tomorrow's visit in advance") ||
    lower.includes("closed for the night") ||
    lower.includes("now it is closed")
  );
}

/**
 * Main dialogue engine handling multi-turn state/city discovery, dynamic party size,
 * guide negotiation, non-database rejection, night-time closing, and login reminders.
 */
export function generateConciergeResponse(
  query: string,
  lang = "en",
  sessionId?: string,
  history?: Array<{ role: string; text?: string; content?: string }>
): string {
  const q = query.toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9]/g, "");
  const ist = getISTContext();
  const crowd = getLiveCrowdTelemetry();
  const detectedLang = detectQueryLanguage(query, lang);

  const activeKey = sessionId || "default_session";
  const state: BookingSessionState = sessionStates.get(activeKey) || {
    step: "idle",
  };

  // Reconstruct state from history if present and session is idle or newly loaded
  if (state.step === "idle" && history && history.length > 0) {
    const combinedHistory = history.map((h) => h.text || h.content || "").join(" ");
    const lastAssistant =
      [...history].reverse().find((h) => h.role === "assistant")?.text ||
      [...history].reverse().find((h) => h.role === "assistant")?.content ||
      "";

    const histMon = matchSpecificMonument(combinedHistory);
    if (histMon) {
      state.siteSlug = histMon.slug;
      state.siteName = histMon.name;
    }

    const histPartyMatch =
      combinedHistory.match(/\b(\d+)\s*(?:member|members|visitor|visitors|ticket|tickets|people|person|persons)\b/i) ||
      combinedHistory.match(/\bfor\s+(\d+)\b/i);
    if (histPartyMatch) {
      state.partySize = parseInt(histPartyMatch[1], 10);
    }

    if (isDateMentionedInQuery(combinedHistory)) {
      state.visitDate = parseDateFromQuery(combinedHistory, ist);
      state.visitSlot = parseSlotFromQuery(combinedHistory);
    }

    const histGuide = extractRequestedGuide(combinedHistory);
    if (histGuide) {
      state.guideId = histGuide.id;
      state.guideName = histGuide.name;
      state.guideRate = histGuide.rate;
      state.isSelfGuided = histGuide.id === "none";
    }

    const lastAsstLower = lastAssistant.toLowerCase();
    if (
      lastAsstLower.includes("confirm and proceed") ||
      lastAsstLower.includes("proceed with") ||
      lastAsstLower.includes("proceed karna chahenge") ||
      lastAsstLower.includes("आगे बढ़ना चाहेंगे")
    ) {
      state.step = "offered_best_guide";
    } else if (
      lastAsstLower.includes("alternative") ||
      lastAsstLower.includes("vikalp") ||
      lastAsstLower.includes("which guide would you like to choose") ||
      lastAsstLower.includes("kiske sath proceed karna chahenge")
    ) {
      state.step = "awaiting_alternative_guide";
    } else if (
      lastAsstLower.includes("book your tickets and an authorized asi guide for tomorrow morning") ||
      lastAsstLower.includes("tickets aur guide advance mein book kar doon") ||
      lastAsstLower.includes("अग्रिम टिकट और अधिकृत गाइड बुक करना चाहते हैं") ||
      lastAsstLower.includes("book for tomorrow's visit in advance") ||
      lastAsstLower.includes("closed for the night") ||
      lastAsstLower.includes("now it is closed")
    ) {
      state.step = "awaiting_night_booking_confirmation";
      if (!state.visitDate) state.visitDate = ist.tomorrowStr;
      if (!state.visitSlot) state.visitSlot = "06:00 AM (Sunrise Slot)";
    } else if (lastAsstLower.includes("date and time") || lastAsstLower.includes("tareekh")) {
      state.step = "awaiting_datetime";
    } else if (lastAsstLower.includes("how many visitors") || lastAsstLower.includes("kitne log")) {
      state.step = "awaiting_party_size";
    }

    sessionStates.set(activeKey, state);
  }

  // ─── 0. CHECK FOR SITES NOT PRESENT IN DATABASE ─────────────────────────
  const isBookingInitiation =
    /\b(book|booking|ticket|tickets|reserve|reservation|pass)\b/i.test(q) &&
    !q.includes("best time") &&
    !q.includes("sahi waqt");

  const isAskingBestTimeOrNow =
    /\b(sahi waqt|sahi time|best time|good time|right time|kya mai abhi|can i visit|visit now|open now|jaane ke liye|jane ke liye|jane ka|jaane ka|abhi jaa|abhi jane|kya yeh sahi|kya yah sahi)\b/i.test(q) ||
    q.includes("best time to see") ||
    q.includes("best time to visit") ||
    q.includes("sahi waqt hai");

  if (isBookingInitiation) {
    const requestedPlace = extractRequestedPlaceName(query);
    if (requestedPlace && !isKnownMonument(requestedPlace)) {
      if (detectedLang === "hinglish") {
        return (
          `Maaf kijiye, hum **${requestedPlace}** ke liye tickets provide nahi karte hain. ` +
          `Hum sirf Bharat ke official heritage monuments (jaise The Taj Mahal, Hampi, Amber Fort, Qutub Minar, Red Fort, Mysore Palace) ke verified tickets aur certified ASI guides provide karte hain.`
        );
      }
      if (detectedLang === "hi") {
        return (
          `क्षमा करें, हम **${requestedPlace}** के लिए टिकट प्रदान नहीं करते हैं। ` +
          `हम केवल भारत के अधिकृत ऐतिहासिक स्मारकों (जैसे ताजमहल, हम्पी, आमेर किला, कुतुब मीनार, लाल किला) के लिए टिकट और एएसआई प्रमाणित गाइड प्रदान करते हैं।`
        );
      }
      return (
        `Sorry, we don't provide tickets for **${requestedPlace}**. ` +
        `We only provide verified tickets and certified ASI guides for official Indian heritage monuments such as the Taj Mahal, Hampi, Amber Fort, Qutub Minar, Red Fort, and other historical sites across India.`
      );
    }
  }

  // ─── 1. QUERY: WHAT ALL TOURIST PLACES TICKETS YOU PROVIDE ──────────────
  const isAskingWhatTicketsProvided =
    /\b(what all|which|what)\b.*(?:tourist places?|places?|monuments?|sites?).*(?:tickets?|passes?|entry).*(?:provide|have|sell|offer|available)/i.test(q) ||
    /\b(what tickets|which tickets|tickets you provide|tickets provide karte ho|tickets available|kahan ke ticket|kaunse places ke ticket)\b/i.test(q) ||
    /\b(किन\s*किन|कौन\s*कौन|किस\s*किस|कहाँ\s*कहाँ|पर्यटन स्थल|टिकट देते|टिकट प्रदान|टिकट उपलब्ध)\b/i.test(query) ||
    /\b(kahan kahan|kaun kaun|kon kon|kiske ticket|kiske tickets|tickets provide|tickets milte)\b/i.test(q) ||
    (q.includes("tourist places tickets") && (q.includes("what") || q.includes("which") || q.includes("provide")));

  if (isAskingWhatTicketsProvided) {
    state.step = "awaiting_state_or_city";
    state.lang = detectedLang;
    sessionStates.set(activeKey, state);

    if (detectedLang === "hinglish") {
      return (
        `Hum Bharat ke 19 states aur 35 cities ke **46 official heritage monuments** ke verified entry tickets aur certified ASI guides provide karte hain!\n\n` +
        `Aap kis **state ya city** ke liye tickets dekh rahe hain? (jaise Delhi, Uttar Pradesh / Agra, Rajasthan / Jaipur, Karnataka, Maharashtra / Mumbai, West Bengal, Tamil Nadu, Kerala, Gujarat, Punjab...)`
      );
    }
    if (detectedLang === "hi") {
      return (
        `हम भारत के 19 राज्यों और 35 शहरों के **46 आधिकारिक ऐतिहासिक धरोहरों** के लिए सत्यापित प्रवेश टिकट और प्रमाणित एएसआई गाइड प्रदान करते हैं!\n\n` +
        `आप किस **राज्य या शहर** के स्मारकों के लिए टिकट देखना चाहते हैं? (उदा. दिल्ली, उत्तर प्रदेश / आगरा, राजस्थान / जयपुर, कर्नाटक, महाराष्ट्र / मुंबई, पश्चिम बंगाल, तमिलनाडु, केरल, गुजरात, पंजाब...)`
      );
    }
    return (
      `We provide official entry tickets and certified ASI guides across **46 heritage destinations** in 19 states and 35 cities across India!\n\n` +
      `Which **state or city** are you looking to visit? (e.g., Delhi, Uttar Pradesh / Agra, Rajasthan / Jaipur, Karnataka, Maharashtra / Mumbai, West Bengal, Tamil Nadu, Kerala, Gujarat, Punjab...)`
    );
  }

  // Check if a guide was explicitly requested in the query (e.g. "under Rajesh Kumar as guide")
  const explicitlyMentionedGuide = extractRequestedGuide(q);
  if (explicitlyMentionedGuide) {
    state.guideId = explicitlyMentionedGuide.id;
    state.guideName = explicitlyMentionedGuide.name;
    state.guideRate = explicitlyMentionedGuide.rate;
    state.isSelfGuided = explicitlyMentionedGuide.id === "none";
  }

  // ─── 2. USER PROVIDES STATE / CITY OR SITES ARE FILTERED BY LOCATION ────
  const matchedRegion = matchKnownRegion(q);
  if (
    matchedRegion &&
    (state.step === "awaiting_state_or_city" ||
      state.step === "idle" ||
      state.step === "awaiting_monument_choice" ||
      !matchSpecificMonument(q))
  ) {
    const regionalSites = findSitesByRegion(matchedRegion);
    if (regionalSites.length > 0) {
      state.step = "awaiting_monument_choice";
      state.selectedRegion = matchedRegion;
      state.lang = detectedLang;
      sessionStates.set(activeKey, state);

      const capitalizedRegion = matchedRegion
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const siteListFormatted = regionalSites
        .map((s) => `- 🏛️ **${s.name}** (Entry: ₹${s.priceInr} | Rating: ⭐ ${s.googleRating ?? 4.5} | Live Crowd: ${s.crowdPercent ?? 30}%)`)
        .join("\n");

      if (detectedLang === "hinglish") {
        return (
          `**${capitalizedRegion}** mein hum nimnalikhit prasiddh monuments ke official tickets aur certified ASI guides provide karte hain:\n\n` +
          `${siteListFormatted}\n\n` +
          `Aap inmein se kis monument ke liye ticket book karna chahenge?`
        );
      }
      if (detectedLang === "hi") {
        return (
          `**${capitalizedRegion}** में हम निम्नलिखित ऐतिहासिक स्मारकों के लिए अधिकृत टिकट और प्रमाणित गाइड प्रदान करते हैं:\n\n` +
          `${siteListFormatted}\n\n` +
          `आप इनमें से किस स्मारक का भ्रमण करना चाहते हैं?`
        );
      }
      return (
        `In **${capitalizedRegion}**, we provide official tickets and verified ASI guides for the following monuments:\n\n` +
        `${siteListFormatted}\n\n` +
        `Which of these monuments would you like to visit?`
      );
    }
  }

  // ─── 3. USER SPECIFIES MONUMENT NAME -> MUST ASK VISITOR COUNT ──────────
  const directMonumentMatch = matchSpecificMonument(q);

  const partyMatch =
    q.match(/\b(\d+)\s*(?:member|members|visitor|visitors|ticket|tickets|people|person|persons|log|jana|vyakti|personas?)\b/i) ||
    q.match(/\bfor\s+(\d+)\b/i);
  const explicitPartySize = partyMatch ? Math.max(1, parseInt(partyMatch[1], 10)) : null;

  const isDirectBookingOrMonumentMention =
    directMonumentMatch !== null &&
    !isAskingBestTimeOrNow &&
    (
      isBookingInitiation ||
      explicitPartySize !== null ||
      state.step === "idle" ||
      state.step === "completed" ||
      state.step === "awaiting_monument_choice" ||
      state.step === "awaiting_state_or_city" ||
      state.step === "awaiting_night_booking_confirmation" ||
      state.step === "offered_best_guide" ||
      state.step === "awaiting_datetime" ||
      (state.siteSlug !== undefined && directMonumentMatch.slug !== state.siteSlug)
    );

  if (isDirectBookingOrMonumentMention && directMonumentMatch) {
    state.siteSlug = directMonumentMatch.slug;
    state.siteName = directMonumentMatch.name;
    state.lang = detectedLang;

    // If visitor count was ALREADY given in this message (e.g. "book ticket for 3 members for Statue of Unity")
    if (explicitPartySize !== null) {
      state.partySize = explicitPartySize;

      // Also check if date was given in the same message (e.g. "for 21st october")
      if (isDateMentionedInQuery(q)) {
        const parsedDate = parseDateFromQuery(q, ist);
        const parsedSlot = parseSlotFromQuery(q);
        state.visitDate = parsedDate;
        state.visitSlot = parsedSlot;
        state.step = "offered_best_guide";
        sessionStates.set(activeKey, state);

        const activeGuide =
          explicitlyMentionedGuide ||
          (state.guideId ? VERIFIED_GUIDES.find((g) => g.id === state.guideId) : null) ||
          VERIFIED_GUIDES[0];
        state.guideId = activeGuide.id;
        state.guideName = activeGuide.name;
        state.guideRate = activeGuide.rate;
        state.isSelfGuided = activeGuide.id === "none";

        const matchedSite = sites.find((s) => s.slug === state.siteSlug) || sites[0];
        const entryFeePerPerson = matchedSite.priceInr || 1100;
        const siteEntryTotal = entryFeePerPerson * explicitPartySize;
        const guideTotal = activeGuide.rate * 3;
        const subtotal = siteEntryTotal + guideTotal;
        const grandTotal = subtotal + Math.round(subtotal * 0.15);

        return (
          `Great! For **${parsedDate}** at **${parsedSlot}**, the estimated price for **${directMonumentMatch.name}** with ${explicitlyMentionedGuide ? `requested verified guide **${activeGuide.name}**` : `top-rated guide **${activeGuide.name}**`} (⭐ ${activeGuide.rating} rating, ${activeGuide.tours}+ tours) is **₹${activeGuide.rate}/hr** (₹${guideTotal} for a 3-hour tour), with total estimate of **₹${grandTotal.toLocaleString("en-IN")}** including ${explicitPartySize} members entry tickets and taxes.\n\n` +
          `Would you like to confirm and proceed with ${activeGuide.name}?`
        );
      }

      state.step = "awaiting_datetime";
      sessionStates.set(activeKey, state);

      const isTajFriday = directMonumentMatch.slug === "taj-mahal" && ist.dayOfWeek === 5;
      const nightNoteEn = ist.isNight
        ? `\n\n*(Note: Gates are currently closed for tonight as per IST timings. We recommend tomorrow morning's Sunrise Slot (06:00 AM – 09:00 AM) or your preferred date.)*`
        : isTajFriday
        ? `\n\n*(Note: The Taj Mahal is closed on Fridays for prayers. Please choose Saturday or another day.)*`
        : "";

      const nightNoteHinglish = ist.isNight
        ? `\n\n*(Note: Abhi IST ke mutabiq raat ke waqt monument band hai. Hum kal subah ka Sunrise Slot (06:00 AM – 09:00 AM) ya aapki pasand ki tareekh recommend karte hain.)*`
        : isTajFriday
        ? `\n\n*(Note: Friday ko Taj Mahal band rehta hai. Kripya Saturday ya doosra din chunein.)*`
        : "";

      const nightNoteHi = ist.isNight
        ? `\n\n*(नोट: भारतीय समयानुसार (IST) इस समय रात होने के कारण स्मारक बंद है। हम कल सुबह सनराइज स्लॉट (06:00 AM – 09:00 AM) या आपकी पसंद की किसी भी तारीख की सलाह देते हैं।)*`
        : isTajFriday
        ? `\n\n*(नोट: शुक्रवार को नमाज़ के कारण ताजमहल बंद रहता है। कृपया शनिवार या अन्य दिन चुनें।)*`
        : "";

      const nightNoteEs = ist.isNight
        ? `\n\n*(Nota: Las puertas están cerradas por la noche según el horario IST. Recomendamos el turno del amanecer de mañana (06:00 – 09:00 hrs) o la fecha de su elección.)*`
        : "";

      if (detectedLang === "hinglish") {
        return `Zaroor! Aapko **${directMonumentMatch.name}** (${explicitPartySize} members) ke liye kis date aur time ke tickets chahiye?${nightNoteHinglish}`;
      }
      if (detectedLang === "hi") {
        return `ज़रूर! आपको **${directMonumentMatch.name}** (${explicitPartySize} सदस्यों) के लिए किस तारीख और समय के टिकट चाहिए?${nightNoteHi}`;
      }
      if (detectedLang === "es") {
        return `¡Claro! ¿Para qué fecha y hora necesita las entradas para **${directMonumentMatch.name}** (${explicitPartySize} ${explicitPartySize === 1 ? "persona" : "personas"})?${nightNoteEs}`;
      }
      return `Sure! What date and time do you need tickets for **${directMonumentMatch.name}** (${explicitPartySize} ${explicitPartySize === 1 ? "visitor" : "members"})?${nightNoteEn}`;
    }

    // NEVER default to Taj Mahal or 2 members; ask party size explicitly
    state.step = "awaiting_party_size";
    sessionStates.set(activeKey, state);

    if (detectedLang === "hinglish") {
      return `Aap **${directMonumentMatch.name}** ke liye kitne visitors / members ke tickets book karna chahte hain?`;
    }
    if (detectedLang === "hi") {
      return `आप **${directMonumentMatch.name}** के लिए कितने आगंतुकों (सदस्यों) के टिकट बुक करना चाहते हैं?`;
    }
    if (detectedLang === "es") {
      return `¿Cuántos visitantes o miembros asistirán a **${directMonumentMatch.name}**?`;
    }
    return `How many visitors/members will be visiting **${directMonumentMatch.name}**?`;
  }

  // ─── 4. USER ANSWERS VISITOR COUNT (PARTY SIZE) ──────────────────────────
  if (state.step === "awaiting_party_size") {
    const rawNumberMatch = q.match(/\b(\d+)\b/);
    if (rawNumberMatch) {
      const partySize = Math.max(1, parseInt(rawNumberMatch[1], 10));
      state.partySize = partySize;
      state.step = "awaiting_datetime";
      sessionStates.set(activeKey, state);

      const monumentName = state.siteName || "the monument";
      const isTajFriday = (state.siteSlug || "").includes("taj") && ist.dayOfWeek === 5;

      const nightNoteEn = ist.isNight
        ? `\n\n*(Note: Gates are currently closed for tonight as per IST timings. We recommend tomorrow morning's Sunrise Slot (06:00 AM – 09:00 AM) or your preferred date.)*`
        : isTajFriday
        ? `\n\n*(Note: The Taj Mahal is closed on Fridays for prayers. Please choose Saturday or another day.)*`
        : "";

      const nightNoteHinglish = ist.isNight
        ? `\n\n*(Note: Abhi IST ke mutabiq raat ke waqt monument band hai. Hum kal subah ka Sunrise Slot (06:00 AM – 09:00 AM) ya aapki pasand ki tareekh recommend karte hain.)*`
        : isTajFriday
        ? `\n\n*(Note: Friday ko Taj Mahal band rehta hai. Kripya Saturday ya doosra din chunein.)*`
        : "";

      const nightNoteHi = ist.isNight
        ? `\n\n*(नोट: भारतीय समयानुसार (IST) इस समय रात होने के कारण स्मारक बंद है। हम कल सुबह सनराइज स्लॉट (06:00 AM – 09:00 AM) या आपकी पसंद की किसी भी तारीख की सलाह देते हैं।)*`
        : isTajFriday
        ? `\n\n*(नोट: शुक्रवार को नमाज़ के कारण ताजमहल बंद रहता है। कृपया शनिवार या अन्य दिन चुनें।)*`
        : "";

      if (detectedLang === "hinglish") {
        return `Shukriya! Aapko **${monumentName}** (${partySize} members) ke liye kis date aur time slot ke tickets chahiye?${nightNoteHinglish}`;
      }
      if (detectedLang === "hi") {
        return `धन्यवाद! आपको **${monumentName}** (${partySize} सदस्यों) के लिए किस तारीख और समय (स्लॉट) के टिकट चाहिए?${nightNoteHi}`;
      }
      return `Sure! What date and time do you need tickets for **${monumentName}** (${partySize} ${partySize === 1 ? "visitor" : "members"})?${nightNoteEn}`;
    }
  }

  // ─── 5. USER PROVIDES DATE & TIME -> OFFER GUIDE ESTIMATE ────────────────
  const currentStep = state.step as string;
  const isAnsweringDateOrSlot =
    currentStep === "awaiting_datetime" ||
    isDateMentionedInQuery(q) ||
    (/\b(tomorrow|kal|today|aaj|sunrise|morning|afternoon|sunset|subah|shaam|am|pm|\d{1,2}\s*(?:am|pm|baje))\b/i.test(q) &&
      currentStep === "awaiting_datetime");

  if (isAnsweringDateOrSlot && currentStep === "awaiting_datetime") {
    // Robust date parsing (e.g. "21st october" -> "2026-10-21")
    const parsedDate = parseDateFromQuery(q, ist);
    const parsedSlot = parseSlotFromQuery(q);

    state.visitDate = parsedDate;
    state.visitSlot = parsedSlot;
    state.step = "offered_best_guide";
    if (detectedLang !== "en") state.lang = detectedLang;

    // Use requested guide if user explicitly named one (e.g. Rajesh Kumar), otherwise top-rated Vikram Singh
    const activeGuide =
      explicitlyMentionedGuide ||
      (state.guideId ? VERIFIED_GUIDES.find((g) => g.id === state.guideId) : null) ||
      VERIFIED_GUIDES[0];

    state.guideId = activeGuide.id;
    state.guideName = activeGuide.name;
    state.guideRate = activeGuide.rate;
    state.isSelfGuided = activeGuide.id === "none";
    sessionStates.set(activeKey, state);

    const stepLang = detectedLang !== "en" ? detectedLang : state.lang || "en";

    const matchedSite = sites.find((s) => s.slug === state.siteSlug) || sites[0];
    const monumentName = state.siteName || matchedSite.name;
    const partySize = state.partySize || 1;
    const entryFeePerPerson = matchedSite.priceInr || 1100;
    const siteEntryTotal = entryFeePerPerson * partySize;
    const guideTotal = activeGuide.rate * 3;
    const subtotal = siteEntryTotal + guideTotal;
    const grandTotal = subtotal + Math.round(subtotal * 0.15);

    const isUserChosenGuide = Boolean(explicitlyMentionedGuide || (state.guideId && state.guideId !== "G-AGR-05"));

    if (stepLang === "hinglish") {
      return (
        `Shandar! **${parsedDate}** ko **${parsedSlot}** ke liye **${monumentName}** (${partySize} members), ${isUserChosenGuide ? `aapke chune gaye certified guide **${activeGuide.name}**` : `hamare top-rated guide **${activeGuide.name}**`} (⭐ ${activeGuide.rating} rating, ${activeGuide.tours}+ tours) ke sath estimated price **₹${activeGuide.rate}/hr** (3 ghante ke ₹${guideTotal}) hai, aur entry tickets mila kar total estimate **₹${grandTotal.toLocaleString("en-IN")}** hai.\n\n` +
        `Kya aap ${activeGuide.name} ke sath proceed karna chahenge?`
      );
    }
    if (stepLang === "hi") {
      return (
        `शानदार! **${parsedDate}** को **${parsedSlot}** के लिए **${monumentName}** (${partySize} सदस्यों), ${isUserChosenGuide ? `आपके चुने हुए प्रमाणित गाइड **${activeGuide.name}**` : `हमारे सर्वोच्च रेटेड गाइड **${activeGuide.name}**`} (⭐ ${activeGuide.rating} रेटिंग, ${activeGuide.tours}+ टूर) के साथ अनुमानित गाइड शुल्क **₹${activeGuide.rate}/घंटे** (3 घंटे के ₹${guideTotal}) है, और प्रवेश टिकट मिलाकर कुल अनुमानित राशि **₹${grandTotal.toLocaleString("en-IN")}** है।\n\n` +
        `क्या आप ${activeGuide.name} के साथ आगे बढ़ना चाहेंगे?`
      );
    }
    return (
      `Great! For **${parsedDate}** at **${parsedSlot}**, the estimated price for **${monumentName}** with ${isUserChosenGuide ? `your requested verified guide **${activeGuide.name}**` : `our top-rated guide **${activeGuide.name}**`} (⭐ ${activeGuide.rating} rating, ${activeGuide.tours}+ tours) is **₹${activeGuide.rate}/hr** (₹${guideTotal} for a 3-hour tour), with total estimate of **₹${grandTotal.toLocaleString("en-IN")}** including ${partySize} ${partySize === 1 ? "visitor" : "members"} entry tickets and taxes.\n\n` +
      `Would you like to proceed with ${activeGuide.name}?`
    );
  }

  // ─── 5A. USER SAYS YES TO AWAITING_DATETIME PROMPT ──────────────────────
  if (currentStep === "awaiting_datetime" && /\b(yes|sure|ok|okay|confirm|proceed|haan|theek hai|kardo|yep|yeah)\b/i.test(q)) {
    state.visitDate = ist.tomorrowStr;
    state.visitSlot = "06:00 AM (Sunrise Slot)";
    state.step = "offered_best_guide";
    if (detectedLang !== "en") state.lang = detectedLang;

    const activeGuide =
      explicitlyMentionedGuide ||
      (state.guideId ? VERIFIED_GUIDES.find((g) => g.id === state.guideId) : null) ||
      VERIFIED_GUIDES[0];

    state.guideId = activeGuide.id;
    state.guideName = activeGuide.name;
    state.guideRate = activeGuide.rate;
    state.isSelfGuided = activeGuide.id === "none";
    sessionStates.set(activeKey, state);

    const stepLang = detectedLang !== "en" ? detectedLang : state.lang || "en";
    const matchedSite = sites.find((s) => s.slug === state.siteSlug) || sites[0];
    const monumentName = state.siteName || matchedSite.name;
    const partySize = state.partySize || 1;
    const entryFeePerPerson = matchedSite.priceInr || 1100;
    const siteEntryTotal = entryFeePerPerson * partySize;
    const guideTotal = activeGuide.rate * 3;
    const subtotal = siteEntryTotal + guideTotal;
    const grandTotal = subtotal + Math.round(subtotal * 0.15);

    if (stepLang === "hinglish") {
      return (
        `Shandar! Humne **${monumentName}** ke liye kal subah (${state.visitDate}) **06:00 AM (Sunrise Slot)** chun liya hai. Hamare top-rated guide **${activeGuide.name}** (⭐ ${activeGuide.rating} rating, ${activeGuide.tours}+ tours) ke sath estimated price **₹${activeGuide.rate}/hr** (3 ghante ke ₹${guideTotal}) hai, aur ${partySize} members ke entry tickets mila kar total estimate **₹${grandTotal.toLocaleString("en-IN")}** hai.\n\n` +
        `Kya aap ${activeGuide.name} ke sath proceed karna chahenge?`
      );
    }
    if (stepLang === "hi") {
      return (
        `शानदार! हमने **${monumentName}** के लिए कल सुबह (${state.visitDate}) **06:00 AM (सनराइज स्लॉट)** निर्धारित कर दिया है। हमारे सर्वोच्च रेटेड गाइड **${activeGuide.name}** (⭐ ${activeGuide.rating} रेटिंग, ${activeGuide.tours}+ टूर) के साथ अनुमानित शुल्क **₹${activeGuide.rate}/घंटे** (3 घंटे के ₹${guideTotal}) है, और कुल अनुमानित राशि **₹${grandTotal.toLocaleString("en-IN")}** है।\n\n` +
        `क्या आप ${activeGuide.name} के साथ आगे बढ़ना चाहेंगे?`
      );
    }
    if (stepLang === "es") {
      return (
        `¡Excelente! Hemos programado su visita para mañana por la mañana (${state.visitDate}) a las **06:00 AM (Turno Amanecer)** para **${monumentName}**. El precio estimado con el guía **${activeGuide.name}** (⭐ ${activeGuide.rating}, ${activeGuide.tours}+ recorridos) es de **₹${activeGuide.rate}/hr** (₹${guideTotal} por 3 horas), con un total estimado de **₹${grandTotal.toLocaleString("en-IN")}**.\n\n` +
        `¿Desea continuar con ${activeGuide.name}?`
      );
    }

    return (
      `Great! We have scheduled your visit for tomorrow morning (${state.visitDate}) at **06:00 AM (Sunrise Slot)** for **${monumentName}**. The estimated price with our top-rated guide **${activeGuide.name}** (⭐ ${activeGuide.rating} rating, ${activeGuide.tours}+ tours) is **₹${activeGuide.rate}/hr** (₹${guideTotal} for a 3-hour tour), with total estimate of **₹${grandTotal.toLocaleString("en-IN")}** including ${partySize} ${partySize === 1 ? "visitor" : "members"} entry tickets and taxes.\n\n` +
      `Would you like to proceed with ${activeGuide.name}?`
    );
  }

  // ─── 5B. USER CONFIRMS TOMORROW MORNING BOOKING AFTER NIGHT CLOSURE ──────
  const isConfirmingNightBooking =
    (currentStep === "awaiting_night_booking_confirmation" ||
      ((state.siteSlug || state.siteName) &&
        lastAssistantQueryWasNightClosure(history) &&
        currentStep !== "offered_best_guide" &&
        currentStep !== "awaiting_alternative_guide" &&
        currentStep !== "completed")) &&
    /\b(yes|sure|ok|okay|confirm|proceed|haan|theek hai|kardo|ha|yep|yeah|book|please book|chalo|done)\b/i.test(q);

  if (isConfirmingNightBooking) {
    state.step = "offered_best_guide";
    if (!state.visitDate) state.visitDate = ist.tomorrowStr;
    if (!state.visitSlot) state.visitSlot = "06:00 AM (Sunrise Slot)";
    if (explicitPartySize !== null) state.partySize = explicitPartySize;
    const partySize = state.partySize || 2;
    state.partySize = partySize;

    const activeGuide =
      explicitlyMentionedGuide ||
      (state.guideId ? VERIFIED_GUIDES.find((g) => g.id === state.guideId) : null) ||
      VERIFIED_GUIDES[0];

    state.guideId = activeGuide.id;
    state.guideName = activeGuide.name;
    state.guideRate = activeGuide.rate;
    state.isSelfGuided = activeGuide.id === "none";
    sessionStates.set(activeKey, state);

    const siteSlug = state.siteSlug || "statue-of-unity";
    const matchedSite = sites.find((s) => s.slug === siteSlug) || sites[0];
    const siteName = state.siteName || matchedSite.name;
    const entryFeePerPerson = matchedSite.priceInr || 350;
    const siteEntryTotal = entryFeePerPerson * partySize;
    const guideTotal = activeGuide.rate * 3;
    const subtotal = siteEntryTotal + guideTotal;
    const grandTotal = subtotal + Math.round(subtotal * 0.15);

    const stepLang = detectedLang !== "en" ? detectedLang : state.lang || "en";

    if (stepLang === "hinglish") {
      return (
        `Shandar! Kal subah (${state.visitDate}) **06:00 AM (Sunrise Slot)** ke liye **${siteName}** (${partySize} members) ka estimated price top-rated guide **${activeGuide.name}** (⭐ ${activeGuide.rating} rating, ${activeGuide.tours}+ tours) ke sath **₹${activeGuide.rate}/hr** (₹${guideTotal} 3-ghante ke tour ke liye) hai.\n\n` +
        `Kul estimate **₹${grandTotal.toLocaleString("en-IN")}** hai jismein ${partySize} members ke entry tickets aur taxes shamil hain.\n\n` +
        `Kya aap ${activeGuide.name} ke sath confirm aur proceed karna chahenge?`
      );
    }

    if (stepLang === "hi") {
      return (
        `शानदार! कल सुबह (${state.visitDate}) **06:00 AM (सनराइज स्लॉट)** के लिए **${siteName}** (${partySize} सदस्यों) का अनुमानित विवरण शीर्ष रेटेड गाइड **${activeGuide.name}** (⭐ ${activeGuide.rating} रेटिंग, ${activeGuide.tours}+ टूर्स) के साथ **₹${activeGuide.rate}/घंटे** (3 घंटे के भ्रमण हेतु ₹${guideTotal}) है।\n\n` +
        `कुल अनुमानित राशि **₹${grandTotal.toLocaleString("en-IN")}** है जिसमें ${partySize} सदस्यों के प्रवेश टिकट और कर शामिल हैं।\n\n` +
        `क्या आप ${activeGuide.name} के साथ पुष्टि करके आगे बढ़ना चाहते हैं?`
      );
    }

    if (stepLang === "es") {
      return (
        `¡Excelente! Para mañana por la mañana (${state.visitDate}) a las **06:00 AM (Turno Amanecer)** en **${siteName}** (${partySize} personas), el precio estimado con el guía mejor calificado **${activeGuide.name}** (⭐ ${activeGuide.rating}, ${activeGuide.tours}+ recorridos) es de **₹${activeGuide.rate}/hr** (₹${guideTotal} por un recorrido de 3 horas), con un total estimado de **₹${grandTotal.toLocaleString("en-IN")}** que incluye entradas e impuestos.\n\n` +
        `¿Desea confirmar y continuar con ${activeGuide.name}?`
      );
    }

    return (
      `Great! For tomorrow morning (${state.visitDate}) at **06:00 AM (Sunrise Slot)**, the estimated price for **${siteName}** (${partySize} ${partySize === 1 ? "visitor" : "members"}) with top-rated guide **${activeGuide.name}** (⭐ ${activeGuide.rating} rating, ${activeGuide.tours}+ tours) is **₹${activeGuide.rate}/hr** (₹${guideTotal} for a 3-hour tour), with total estimate of **₹${grandTotal.toLocaleString("en-IN")}** including ${partySize} members entry tickets and taxes.\n\n` +
      `Would you like to confirm and proceed with ${activeGuide.name}?`
    );
  }

  // ─── 6. USER SAYS GUIDE IS OUT OF BUDGET / TOO EXPENSIVE (OFFER ALTERNATIVES) ──
  const isExpensiveComplaint =
    /\b(out of budget|out of my budget|over budget|beyond budget|not in my budget|can't afford|cannot afford|expensive|mehenga|mahnga|costly|cheaper|cheap|too much|high price|kam karo|budget|bada price|zyada hai|bahut zyada|lower price|other guide|alternative guide|economical|vikalp)\b/i.test(q) ||
    q.includes("out of budget") ||
    (currentStep === "offered_best_guide" && /\b(budget|mehenga|expensive|costly)\b/i.test(q));

  if (isExpensiveComplaint) {
    state.step = "awaiting_alternative_guide";
    sessionStates.set(activeKey, state);

    const stepLang = detectedLang !== "en" ? detectedLang : state.lang || "en";

    if (stepLang === "hinglish") {
      return (
        `Koi baat nahi! Hamare paas kam budget mein behtareen alternative verified guides uplabdh hain:\n\n` +
        `- 🎖️ **Rajesh Kumar** (Rating: ⭐ **4.9**, 180+ tours) — **₹800/hr** (3 ghante ke ₹2,400)\n` +
        `- 🎖️ **Priya Sharma** (Rating: ⭐ **4.8**, 145+ tours) — **₹700/hr** (3 ghante ke ₹2,100)\n` +
        `- 🎖️ **Meera Devi** (Rating: ⭐ **4.7**, 130+ tours) — **₹600/hr** (3 ghante ke ₹1,800)\n` +
        `- 🚶‍♂️ **Self-Guided (Bina Guide)** — **₹0** (Sirf monument entry tickets)\n\n` +
        `Aap inmein se kiske sath proceed karna chahenge: **Rajesh Kumar** (₹800/hr), **Priya Sharma** (₹700/hr), **Meera Devi** (₹600/hr), ya **Self-Guided**?`
      );
    }
    if (stepLang === "hi") {
      return (
        `कोई बात नहीं! हमारे पास किफायती दरों पर बेहतरीन वैकल्पिक प्रमाणित गाइड उपलब्ध हैं:\n\n` +
        `- 🎖️ **राजेश कुमार** (रेटिंग: ⭐ **4.9**, 180+ टूर) — **₹800/घंटे** (3 घंटे के ₹2,400)\n` +
        `- 🎖️ **प्रिया शर्मा** (रेटिंग: ⭐ **4.8**, 145+ टूर) — **₹700/घंटे** (3 घंटे के ₹2,100)\n` +
        `- 🎖️ **मीरा देवी** (रेटिंग: ⭐ **4.7**, 130+ टूर) — **₹600/घंटे** (3 घंटे के ₹1,800)\n` +
        `- 🚶‍♂️ **स्वयं भ्रमण (बिना गाइड)** — **₹0** (केवल प्रवेश टिकट)\n\n` +
        `आप इनमें से किसके साथ आगे बढ़ना चाहेंगे: **राजेश कुमार** (₹800/घंटे), **प्रिया शर्मा** (₹700/घंटे), **मीरा देवी** (₹600/घंटे), या **स्वयं भ्रमण**?`
      );
    }
    return (
      `No worries! We have great alternative verified guides at more economical rates:\n\n` +
      `- 🎖️ **Rajesh Kumar** (Rating: ⭐ **4.9**, 180+ tours) — **₹800/hr** (₹2,400 for 3 hrs)\n` +
      `- 🎖️ **Priya Sharma** (Rating: ⭐ **4.8**, 145+ tours) — **₹700/hr** (₹2,100 for 3 hrs)\n` +
      `- 🎖️ **Meera Devi** (Rating: ⭐ **4.7**, 130+ tours) — **₹600/hr** (₹1,800 for 3 hrs)\n` +
      `- 🚶‍♂️ **Self-Guided (No Guide)** — **₹0** (Monument tickets only)\n\n` +
      `Which guide would you like to choose: **Rajesh Kumar** (₹800/hr), **Priya Sharma** (₹700/hr), **Meera Devi** (₹600/hr), or **Self-Guided**?`
    );
  }

  // ─── 7. ALTERNATIVE OPTIONS (FOR SITES OR GUIDES) ───────────────────────
  const isAskingAlternatives =
    /\b(alternative|alternatives|other option|other options|aur option|aur vikalp|kuch aur|dusra|any other places?|other places?|dusri jagah)\b/i.test(q);

  if (isAskingAlternatives) {
    if (q.includes("guide") || currentStep === "offered_best_guide" || currentStep === "awaiting_alternative_guide") {
      state.step = "awaiting_alternative_guide";
      sessionStates.set(activeKey, state);
      return (
        `Here are the verified alternative guides available:\n\n` +
        `- 🎖️ **Rajesh Kumar** (Rating: ⭐ 4.9, 180+ tours) — **₹800/hr** (Languages: English, Hindi, Urdu)\n` +
        `- 🎖️ **Priya Sharma** (Rating: ⭐ 4.8, 145+ tours) — **₹700/hr** (Languages: English, Hindi, Sanskrit)\n` +
        `- 🎖️ **Meera Devi** (Rating: ⭐ 4.7, 130+ tours) — **₹600/hr** (Languages: English, Hindi, Gujarati)\n` +
        `- 🚶‍♂️ **Self-Guided Exploration** — **₹0** (No guide fee)\n\n` +
        `Which one would you like to choose?`
      );
    }

    let altSites: CatalogSite[] = [];
    if (state.selectedRegion) {
      altSites = sites.filter((s) => s.region.toLowerCase().includes(state.selectedRegion!.toLowerCase()) && s.slug !== state.siteSlug);
    }
    if (altSites.length === 0) {
      altSites = sites.filter((s) => s.slug !== state.siteSlug).slice(0, 4);
    }

    const altList = altSites
      .map((s) => `- 🏛️ **${s.name}** (${s.region}) — Entry: ₹${s.priceInr} | Rating: ⭐ ${s.googleRating ?? 4.5} | Live Crowd: ${s.crowdPercent ?? 25}%`)
      .join("\n");

    return (
      `Here are wonderful alternative heritage destinations to explore:\n\n` +
      `${altList}\n\n` +
      `Would you like to book tickets or a certified guide for any of these alternatives?`
    );
  }

  // ─── 8. GUIDE CONFIRMATION & BOOKING SUMMARY (WITH LOGIN PROMPT) ────────
  const isAcceptingBestGuide =
    currentStep === "offered_best_guide" &&
    (/\b(yes|proceed|sure|ok|okay|confirm|agree|chalo|haan|theek hai|kardo)\b/i.test(q) ||
      q === "1" ||
      q === "option 1");

  const isAnsweringAlternativeGuide =
    currentStep === "awaiting_alternative_guide" ||
    (currentStep !== "idle" && (explicitlyMentionedGuide !== null || /\b(rajesh|priya|meera|arun|vikram|self|no guide|bina guide)\b/i.test(q)));

  if (isAcceptingBestGuide || isAnsweringAlternativeGuide) {
    let selectedGuide = VERIFIED_GUIDES[1]; // Rajesh Kumar
    let isSelfGuided = false;

    if (explicitlyMentionedGuide) {
      selectedGuide = explicitlyMentionedGuide;
      isSelfGuided = explicitlyMentionedGuide.id === "none";
    } else if (isAcceptingBestGuide) {
      // Respect the guide that was offered in state! Do not unconditionally revert to Vikram Singh!
      selectedGuide = (state.guideId ? VERIFIED_GUIDES.find((g) => g.id === state.guideId) : null) || VERIFIED_GUIDES[0];
      isSelfGuided = selectedGuide.id === "none";
    } else if (q.includes("self") || q.includes("no guide") || q.includes("bina guide") || /\b(?:option\s*4|#4|fourth)\b/i.test(q)) {
      selectedGuide = VERIFIED_GUIDES.find((g) => g.id === "none")!;
      isSelfGuided = true;
    } else if (q.includes("priya") || /\b(?:option\s*2|#2|second)\b/i.test(q)) {
      selectedGuide = VERIFIED_GUIDES.find((g) => g.id === "G-AGR-02")!;
    } else if (q.includes("meera") || /\b(?:option\s*3|#3|third)\b/i.test(q)) {
      selectedGuide = VERIFIED_GUIDES.find((g) => g.id === "G-DEL-04")!;
    } else if (q.includes("vikram")) {
      selectedGuide = VERIFIED_GUIDES.find((g) => g.id === "G-AGR-05")!;
    } else if (q.includes("rajesh") || /\b(?:option\s*1|#1|first)\b/i.test(q)) {
      selectedGuide = VERIFIED_GUIDES.find((g) => g.id === "G-AGR-01")!;
    }

    state.guideId = selectedGuide.id;
    state.guideName = selectedGuide.name;
    state.guideRate = selectedGuide.rate;
    state.isSelfGuided = isSelfGuided;
    state.step = "completed";
    sessionStates.set(activeKey, state);

    // Accurate parsed date
    const visitDate = state.visitDate || (isDateMentionedInQuery(q) ? parseDateFromQuery(q, ist) : ist.tomorrowStr);
    const visitSlot = state.visitSlot || "09:00 AM (Morning Slot)";
    const partySize = state.partySize || 1;
    const siteSlug = state.siteSlug || "taj-mahal";
    const siteName = state.siteName || "The Taj Mahal";

    // Pricing calculation
    const matchedSite = sites.find((s) => s.slug === siteSlug) || sites[0];
    const entryFeePerPerson = matchedSite.priceInr || 1100;
    const siteEntryTotal = entryFeePerPerson * partySize;
    const guideFeeTotal = isSelfGuided ? 0 : selectedGuide.rate * 3;
    const subtotal = siteEntryTotal + guideFeeTotal;
    const conciergeFee = Math.round(subtotal * 0.1);
    const taxes = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + conciergeFee + taxes;

    const checkoutUrl = `/checkout?site=${siteSlug}&partySize=${partySize}&date=${visitDate}&slot=${encodeURIComponent(visitSlot)}&guide=${encodeURIComponent(selectedGuide.name)}&guideId=${selectedGuide.id}`;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "heritage_last_chat_booking",
          JSON.stringify({
            siteSlug,
            siteName,
            partySize,
            visitDate,
            visitSlot,
            guideId: selectedGuide.id,
            guideName: selectedGuide.name,
            totalINR: grandTotal,
          })
        );
      } catch {}
    }
    const stepLang = detectedLang !== "en" ? detectedLang : state.lang || "en";

    if (stepLang === "hinglish") {
      return (
        `Behtareen choice! Aapki booking summary taiyar hai:\n\n` +
        `📋 **Booking Summary:**\n` +
        `- **Monument:** ${siteName} (${matchedSite.region})\n` +
        `- **Visitors:** ${partySize} ${partySize === 1 ? "Member" : "Members"}\n` +
        `- **Date & Slot:** ${visitDate} (${visitSlot})\n` +
        `- **Guide:** ${selectedGuide.name} ${isSelfGuided ? "(No Guide Fee)" : `(ASI License: \`${selectedGuide.license}\`)`}\n` +
        `- **Monument Entry:** ₹${siteEntryTotal.toLocaleString("en-IN")} (₹${entryFeePerPerson} × ${partySize})\n` +
        (!isSelfGuided ? `- **Guide Fee (3 hrs):** ₹${guideFeeTotal.toLocaleString("en-IN")}\n` : "") +
        `- **Concierge & GST:** ₹${(conciergeFee + taxes).toLocaleString("en-IN")}\n` +
        `- **Grand Total:** **₹${grandTotal.toLocaleString("en-IN")}**\n\n` +
        `📌 **Account Notice:** Agar aapne abhi tak account create ya login nahi kiya hai, toh kripya **[Log In](/login)** ya **[Sign Up](/signup)** karein taaki aapka confirmed ticket, live alerts aur notifications aapke dashboard profile mein hamesha surakshit rahein!\n\n` +
        `👉 **[Click Here to Proceed to Payment & Confirm Ticket](${checkoutUrl})**\n\n` +
        `Payment screen par aapko confirmation prompt (Yes/No) milega jisse aapka official ASI ticket confirm ho jayega!`
      );
    }

    if (stepLang === "hi") {
      return (
        `शानदार! आपका बुकिंग विवरण तैयार है:\n\n` +
        `📋 **बुकिंग सारांश:**\n` +
        `- **स्मारक:** ${siteName} (${matchedSite.region})\n` +
        `- **आगंतुक:** ${partySize} सदस्य\n` +
        `- **तारीख व समय:** ${visitDate} (${visitSlot})\n` +
        `- **गाइड:** ${selectedGuide.name} ${isSelfGuided ? "(स्वयं भ्रमण)" : `(लाइसेंस: \`${selectedGuide.license}\`)`}\n` +
        `- **प्रवेश शुल्क:** ₹${siteEntryTotal.toLocaleString("en-IN")} (₹${entryFeePerPerson} × ${partySize})\n` +
        (!isSelfGuided ? `- **गाइड शुल्क (3 घंटे):** ₹${guideFeeTotal.toLocaleString("en-IN")}\n` : "") +
        `- **कंसीयर्ज एवं जीएसटी:** ₹${(conciergeFee + taxes).toLocaleString("en-IN")}\n` +
        `- **कुल राशि:** **₹${grandTotal.toLocaleString("en-IN")}**\n\n` +
        `📌 **खाता सूचना:** यदि आपने अभी तक लॉग इन नहीं किया है, तो कृपया **[लॉग इन](/login)** या **[साइन अप](/signup)** करें ताकि आपका कन्फर्म टिकट और वास्तविक समय की सूचनाएं आपके डैशबोर्ड में सुरक्षित रहें!\n\n` +
        `👉 **[Click Here to Proceed to Payment & Confirm Ticket](${checkoutUrl})**\n\n` +
        `कृपया ऊपर दिए गए लिंक पर क्लिक करके भुगतान पृष्ठ पर जाएँ। स्क्रीन पर स्वीकृति देते ही आपका टिकट तुरंत कन्फर्म हो जाएगा!`
      );
    }

    return (
      `Excellent choice! Your booking is ready for instant confirmation:\n\n` +
      `📋 **Booking Summary:**\n` +
      `- **Monument:** ${siteName} (${matchedSite.region})\n` +
      `- **Visitors:** ${partySize} ${partySize === 1 ? "Visitor" : "Members"}\n` +
      `- **Visit Date & Slot:** ${visitDate} (${visitSlot})\n` +
      `- **Selected Guide:** ${selectedGuide.name} ${isSelfGuided ? "(Self-Guided Exploration)" : `(ASI License: \`${selectedGuide.license}\`)`}\n` +
      `- **Monument Entry:** ₹${siteEntryTotal.toLocaleString("en-IN")} (₹${entryFeePerPerson} × ${partySize})\n` +
      (!isSelfGuided ? `- **Guide Fee (3 hrs):** ₹${guideFeeTotal.toLocaleString("en-IN")}\n` : "") +
      `- **Concierge & GST:** ₹${(conciergeFee + taxes).toLocaleString("en-IN")}\n` +
      `- **Total Payable:** **₹${grandTotal.toLocaleString("en-IN")}**\n\n` +
      `📌 **Account Notice:** If you haven't logged in yet, please **[Log In](/login)** or **[Sign Up](/signup)** so your booking, confirmed e-tickets, and real-time alerts are permanently saved to your dashboard profile!\n\n` +
      `👉 **[Click Here to Proceed to Payment & Confirm Ticket](${checkoutUrl})**\n\n` +
      `Please click the link above to proceed to our secure checkout page. On the checkout page, you will see a final confirmation prompt (Yes/No) before finalizing your reservation!`
    );
  }

  // ─── 9. NIGHT-TIME & CLOSED HOURS INTELLIGENCE ──────────────────────────
  const matchedSite = sites.find((site) => {
    const sName = site.name.toLowerCase().replace("the ", "");
    const sSlug = site.slug.toLowerCase().replace(/-/g, " ");
    const sCity = site.region.split(",")[0].trim().toLowerCase();
    const cleanName = sName.replace(/[^a-z0-9]/g, "");
    const cleanSlug = sSlug.replace(/[^a-z0-9]/g, "");

    const aliases = SITE_SCRIPT_ALIASES[site.slug] || [];
    const matchesAlias = aliases.some((a) => q.includes(a.toLowerCase()));

    return (
      matchesAlias ||
      q.includes(sName) ||
      q.includes(sSlug) ||
      cleanQ.includes(cleanName) ||
      cleanQ.includes(cleanSlug) ||
      (q.includes(sCity) && sCity.length > 3) ||
      (cleanQ.includes("taj") && (cleanName.includes("taj") || cleanSlug.includes("taj")))
    );
  });

  if (matchedSite) {
    const isTajFriday = matchedSite.slug === "taj-mahal" && ist.dayOfWeek === 5;

    // ─── 9A. USER ASKS AT NIGHT OR OUTSIDE OPEN HOURS ───────────────────
    if (ist.isNight || isTajFriday || (isAskingBestTimeOrNow && ist.isNight)) {
      state.step = "awaiting_night_booking_confirmation";
      state.siteSlug = matchedSite.slug;
      state.siteName = matchedSite.name;
      state.partySize = explicitPartySize || state.partySize || 2;
      state.visitDate = ist.tomorrowStr;
      state.visitSlot = "06:00 AM (Sunrise Slot)";
      state.lang = detectedLang;
      sessionStates.set(activeKey, state);

      if (detectedLang === "hinglish") {
        return (
          `**Abhi ${matchedSite.name} band hai (closing time: shaam 6:00 baje sunset ke baad). Kal ke visit ke liye advance mein book kar lijiye.**\n\n` +
          `${matchedSite.name} roz subah sunrise (06:00 AM) se shaam sunset (06:00 PM) tak khulta hai aur abhi raat ke samay monument ke darwaze band ho chuke hain.\n\n` +
          `Ghoomne ke liye sabse behtar samay **kal subah ka Sunrise Slot (06:00 AM – 09:00 AM)** hai, jab taaza thandi hawa hoti hai, bheed 0% hoti hai aur suraj ki pehli kiran mein safed sangmarmar behad khoobsurat dikhta hai.\n\n` +
          `📋 **Kal ke visit ke liye official details:**\n` +
          `- **Entry Fee:** ₹${matchedSite.priceInr}\n` +
          `- **Opening Time Tomorrow:** 06:00 AM (Sunrise)\n` +
          `- **Certified ASI Guides:** Vikram Singh (₹1200/hr), Rajesh Kumar (₹800/hr), Priya Sharma (₹700/hr)\n\n` +
          `Kya main aapke liye kal ke visit ke tickets aur guide advance mein book kar doon?`
        );
      }

      if (detectedLang === "hi") {
        return (
          `**अभी ${matchedSite.name} बंद है। कृपया कल के भ्रमण के लिए अग्रिम (advance) में टिकट बुक कर लें।**\n\n` +
          `यह स्मारक सूर्योदय (सुबह 06:00 बजे) से सूर्यास्त (शाम 06:00 बजे) तक खुला रहता है और रात के समय प्रवेश बंद रहता है।\n\n` +
          `भ्रमण के लिए सर्वोत्तम समय **कल सुबह सनराइज स्लॉट (06:00 AM – 09:00 AM)** है, जब भीड़ न्यूनतम होती है और सुबह की स्वर्णिम धूप में स्मारक का सौंदर्य अद्वितीय दिखता है।\n\n` +
          `📋 **कल के लिए मुख्य विवरण:**\n` +
          `- **प्रवेश शुल्क:** ₹${matchedSite.priceInr}\n` +
          `- **कल खुलने का समय:** सुबह 06:00 बजे\n` +
          `- **एएसआई प्रमाणित गाइड:** विक्रम सिंह (₹1200/घंटे), राजेश कुमार (₹800/घंटे), प्रिया शर्मा (₹700/घंटे)\n\n` +
          `क्या आप कल के भ्रमण के लिए अग्रिम टिकट और अधिकृत गाइड बुक करना चाहते हैं?`
        );
      }

      if (detectedLang === "bn") {
        return (
          `**এখন ${matchedSite.name} বন্ধ রয়েছে। অনুগ্রহ করে আগামীকালের পরিদর্শনের জন্য অগ্রিম বুকিং করে নিন।**\n\n` +
          `স্মৃতিসৌধটি सूर्योदय (সকাল ০৬:০০) থেকে সূর্যাস্ত (সন্ধ্যা ০৬:০০) পর্যন্ত খোলা থাকে এবং রাতে প্রবেশ বন্ধ থাকে।\n\n` +
          `আগামীকালের সকালের **সানরাইজ স্লট (সকাল ০৬:০০ – ০৯:০০)** পরিদর্শনের জন্য সেরা সময়, যখন ভিড় একেবারে থাকে না।\n\n` +
          `আপনি কি আগামীকালের জন্য টিকিট বা সার্টিফায়েড ASI গাইড বুক করতে চান?`
        );
      }

      if (detectedLang === "ta") {
        return (
          `**தற்போது ${matchedSite.name} மூடப்பட்டுள்ளது. தயவுசெய்து நாளைய வருகைக்கு முன்கூட்டியே முன்பதிவு செய்து கொள்ளுங்கள்.**\n\n` +
          `சூரிய உதயம் முதல் சூரிய அஸ்தமனம் வரை மட்டுமே திறந்திருக்கும். நாளை காலை 06:00 மணி சன்ரைஸ் ஸ்லாட் பார்வையிட சிறந்த நேரம்.\n\n` +
          `நாளைய வருகைக்கான டிக்கெட் மற்றும் ASI வழிகாட்டியை முன்பதிவு செய்ய உதவவா?`
        );
      }

      if (detectedLang === "es") {
        return (
          `**Ahora ${matchedSite.name} está cerrado. Reserve con anticipación para su visita de mañana.**\n\n` +
          `El monumento está abierto desde el amanecer hasta el atardecer (aproximadamente de 06:00 a 18:00 horas) y actualmente las puertas están cerradas por la noche.\n\n` +
          `El mejor momento para visitarlo es **mañana en el turno del amanecer (06:00 – 09:00 hrs)**, con luz dorada y afluencia mínima.\n\n` +
          `¿Desea que reservemos sus entradas y guía certificado para mañana?`
        );
      }

      return (
        `**Now it is closed. Please book for tomorrow's visit in advance.**\n\n` +
        `${matchedSite.name} is strictly open from sunrise (approx 06:00 AM) to sunset (approx 06:00 PM), and gates are currently closed for the night.\n\n` +
        `The absolute best time to see the monument is **tomorrow morning during the Sunrise Slot (06:00 AM – 09:00 AM)**. At sunrise, you will enjoy:\n` +
        `- **Minimal Crowds:** Peaceful strolls with near-zero waiting times.\n` +
        `- **Sublime Photography:** Soft morning rays illuminating the heritage architecture.\n` +
        `- **Cool Weather:** Pleasant morning breeze before the afternoon heat.\n\n` +
        `Key Details for Tomorrow:\n` +
        `- **Entry Fee:** ₹${matchedSite.priceInr}\n` +
        `- **Opening Time Tomorrow:** 06:00 AM (Sunrise)\n` +
        `- **Verified ASI Guides:** Vikram Singh (₹1200/hr), Rajesh Kumar (₹800/hr), Priya Sharma (₹700/hr)\n\n` +
        `Would you like me to book your tickets and an authorized ASI guide for tomorrow morning?`
      );
    }

    // ─── 9B. DAYTIME (OPEN) MONUMENT QUERY ───────────────────────────────
    const guidesList = VERIFIED_GUIDES.slice(0, 4)
      .map((g) => `- **${g.name}** (License: ${g.license}) – Rate: ₹${g.rate}/hr (${g.languages})`)
      .join("\n");

    const weeklyOff = matchedSite.slug === "taj-mahal" ? " (Closed on Fridays)" : "";

    if (detectedLang === "hinglish") {
      return (
        `Namaste! ${matchedSite.name} abhi khula hai (closing time: shaam sunset 6:00 PM).\n\n` +
        `Is waqt **Current Crowd: ${crowd.level} (${crowd.percent}%)** hai, aap araam se visit kar sakte hain.\n\n` +
        `Zaroori Jaankari:\n` +
        `- **Entry Fee:** ₹${matchedSite.priceInr}\n` +
        `- **Timings:** ${matchedSite.openHours}${weeklyOff}\n` +
        `- **Best Time:** Sunrise (06:00 AM – 09:00 AM) aur shaam ka waqt.\n\n` +
        `Hamare verified ASI guides uplabdh hain:\n${guidesList}\n\n` +
        `Kya aap ticket ya guide book karna chahenge?`
      );
    }

    if (detectedLang === "hi") {
      return (
        `नमस्ते! ${matchedSite.name} इस समय खुला है (शाम 06:00 बजे सूर्यास्त तक)।\n\n` +
        `वर्तमान में **Current Crowd: ${crowd.level} (${crowd.percent}%)** है, यानी भीड़ बहुत कम है।\n\n` +
        `मुख्य विवरण:\n` +
        `- **प्रवेश शुल्क:** ₹${matchedSite.priceInr}\n` +
        `- **खुलने का समय:** ${matchedSite.openHours}\n` +
        `- **सर्वोत्तम समय:** सुबह 06:00 AM से 09:00 AM\n\n` +
        `प्रमाणित एएसआई गाइड उपलब्ध हैं:\n${guidesList}\n\n` +
        `क्या आप टिकट या अधिकृत गाइड बुक करना चाहते हैं?`
      );
    }

    return (
      `Namaste! Thank you for inquiring about ${matchedSite.name}. Currently the monument is open (gates close at sunset, approx 06:00 PM).\n\n` +
      `Our live telemetry indicates **Current Crowd: ${crowd.level} (${crowd.percent}%)**, meaning pleasant viewing conditions.\n\n` +
      `Officially Verified Details:\n` +
      `- **Entry Fee:** ₹${matchedSite.priceInr}\n` +
      `- **Opening Hours:** ${matchedSite.openHours}${weeklyOff}\n` +
      `- **Best Time to Visit:** Sunrise (06:00 AM – 09:00 AM) for minimal crowds and soft light.\n\n` +
      `Certified ASI Guides Available:\n${guidesList}\n\n` +
      `Would you like me to book your tickets and guide for today or tomorrow?`
    );
  }

  // ─── 10. QUIET SITES / PLACES TO VISIT / GENERAL RECS ────────────────────
  if (
    q.includes("quiet") ||
    q.includes("peaceful") ||
    q.includes("less crowd") ||
    q.includes("avoid crowd") ||
    q.includes("offbeat") ||
    q.includes("shant")
  ) {
    if (detectedLang === "hinglish") {
      return (
        `Namaste! Agar aap shant aur kam bheed wali jagaho par ghoomna chahte hain, toh yeh sabse behtareen destinations hain:\n\n` +
        `- **Sanchi Stupa (Madhya Pradesh)** — Pristine Buddhist stūpas, **LOW (18%)** crowd.\n` +
        `- **Mandu Fort & Palaces (Madhya Pradesh)** — Medieval Afghan architecture, **LOW (15%)** crowd.\n` +
        `- **Living Root Bridges (Meghalaya)** — UNESCO natural rainforest wonder, **LOW (14%)** crowd.\n` +
        `- **Outer Temples of Hampi (Karnataka)** — Tungabhadra riverbanks par shant vatavaran.\n\n` +
        `Pro-Tip: Popular monuments (jaise Taj Mahal) ke liye subah 6:00 AM sunrise slot visit karein, bheed bilkul kam hoti hai!`
      );
    }

    return (
      `Here are the most serene, low-crowd heritage destinations currently recommended:\n\n` +
      `- **Sanchi Stupa (Madhya Pradesh)** — Ancient Buddhist complex with green lawns (**Current Crowd: LOW (18%)**).\n` +
      `- **Mandu Ruins (Madhya Pradesh)** — Romantic medieval Afghan pavilions (**Current Crowd: LOW (15%)**).\n` +
      `- **Living Root Bridges (Meghalaya)** — UNESCO natural site nestled in subtropical rainforests (**LOW (14%)**).\n` +
      `- **Outer Temples of Hampi (Karnataka)** — Quiet, majestic exploration along the Tungabhadra river.\n\n` +
      `Pro-Tip: For famous monuments like the Taj Mahal, visiting right at sunrise (06:00 AM) guarantees a serene, unhurried experience.`
    );
  }

  // ─── 11. GENERAL TOURIST PLACES / CIRCUITS ──────────────────────────────
  if (
    q.includes("near me") ||
    q.includes("where can i visit") ||
    q.includes("tourist places") ||
    q.includes("places to visit") ||
    q.includes("recommend") ||
    q.includes("destination") ||
    q.includes("kahan ghoomne")
  ) {
    if (detectedLang === "hinglish") {
      return (
        `Namaste! Bharat mein 46 official heritage destinations uplabdh hain:\n\n` +
        `- **Northern Circuit:** Taj Mahal & Agra Fort (Agra), Amber Fort & Hawa Mahal (Jaipur), Qutub Minar & Red Fort (Delhi).\n` +
        `- **Southern Circuit:** Hampi ke ruins (Karnataka), Mysore Palace (Mysuru), Mahabalipuram (Tamil Nadu).\n` +
        `- **Western Circuit:** Ajanta & Ellora Caves (Maharashtra), Mehrangarh Fort (Jodhpur).\n` +
        `- **Spiritual Circuit:** Varanasi Ghats (UP), Jagannath Temple & Konark Sun Temple (Odisha).\n\n` +
        `Aap kis state ya city ke liye ticket ya certified guide book karna chahte hain?`
      );
    }

    return (
      `Here are the top heritage circuits across India (46 destinations available):\n\n` +
      `- **Northern Circuit:** Taj Mahal & Agra Fort (Agra), Amber Fort (Jaipur), Qutub Minar & Red Fort (Delhi).\n` +
      `- **Southern Circuit:** UNESCO ruins of Hampi (Karnataka), Mysore Palace (Mysuru), Mahabalipuram (Tamil Nadu).\n` +
      `- **Western Circuit:** Ancient caves of Ajanta & Ellora (Maharashtra), Mehrangarh Fort (Jodhpur).\n` +
      `- **Spiritual Circuit:** Varanasi Ghats (UP), Jagannath Temple & Konark Sun Temple (Odisha).\n\n` +
      `Which state or city would you like to explore? Tell me and I will present the exact monuments and verified tickets available!`
    );
  }

  // ─── 12. DEFAULT CONCIERGE GREETING ─────────────────────────────────────
  if (detectedLang === "hinglish") {
    return (
      `Namaste! Main aapka AI Heritage Concierge hoon. Main aapko Bharat ke 46 historical monuments (19 states, 35 cities), live crowd levels, ticket booking, aur certified ASI guides ki jaankari de sakta hoon.\n\n` +
      `Aap kis state ya city ke baare mein poochna chahte hain ya kis monument ke tickets book karna chahte hain?`
    );
  }

  if (detectedLang === "hi") {
    return (
      `नमस्ते! मैं आपका एआई हेरिटेज कंसीयर्ज हूँ। मैं आपको भारत के 46 ऐतिहासिक स्मारकों (19 राज्यों, 35 शहरों), टिकट बुकिंग और एएसआई प्रमाणित गाइडों की जानकारी दे सकता हूँ।\n\n` +
      `आप किस राज्य या शहर के स्मारकों के बारे में पूछना चाहते हैं?`
    );
  }

  return (
    `Namaste! I am your AI Heritage Concierge. I can assist you with ticket bookings, live crowd telemetry, entry fees, and certified ASI guide assignments across 46 heritage destinations in India.\n\n` +
    `Which state, city, or monument would you like to explore or book tickets for today?`
  );
}
