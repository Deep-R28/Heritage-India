/**
 * Intelligent client-side / serverless fallback concierge.
 * Provides grounded, rich answers about Indian heritage sites, crowd patterns,
 * guides, tickets, and travel recommendations when the external LLM backend is offline.
 */
import nearbySitesRaw from "@/data/nearby-sites.json";

interface CatalogSite {
  id: string;
  slug: string;
  name: string;
  category: string;
  region: string;
  priceInr: number;
  openHours: string;
  summary: string;
  history?: string;
}

const sites = nearbySitesRaw as CatalogSite[];

export function generateConciergeResponse(query: string, lang = "en"): string {
  const q = query.toLowerCase().trim();

  // 1. Hindi Greeting & Responses
  if (lang === "hi" || /[\u0900-\u097F]/.test(query)) {
    if (q.includes("नमस्ते") || q.includes("हेलो") || q.includes("hi") || q.includes("hello")) {
      return "नमस्ते! मैं आपका हेरिटेज टूरिस्ट असिस्टेंट हूँ। मैं आपको भारत के प्रमुख ऐतिहासिक स्थलों, लाइव भीड़ स्तर, प्रवेश टिकट और एएसआई प्रमाणित गाइडों की जानकारी दे सकता हूँ। आप किस स्थान या शहर के बारे में जानना चाहते हैं?";
    }
    if (q.includes("कहाँ") || q.includes("घूम") || q.includes("स्थान") || q.includes("tourist")) {
      return "भारत में घूमने के लिए कई अद्भुत स्थल हैं! उत्तर में ताजमहल (आगरा), आमेर किला (जयपुर), कुतुब मीनार (दिल्ली); दक्षिण में हम्पी और मैसूर पैलेस; पूर्व में कोणार्क सूर्य मंदिर और पश्चिम में अजंता-एलोरा की गुफाएँ। आप हमारे 'Explore' पेज पर लाइव भीड़ का स्तर भी देख सकते हैं।";
    }
    return `भारत के ऐतिहासिक धरोहरों के बारे में पूछने के लिए धन्यवाद। ताजमहल, कुतुब मीनार, हम्पी या आमेर किले जैसे किसी भी स्मारक की टिकट, समय या भीड़ के बारे में पूछें, मैं आपकी पूरी सहायता करूँगा!`;
  }

  // 2. Specific Monument Matching
  const matchedSite = sites.find((site) => {
    const sName = site.name.toLowerCase();
    const sSlug = site.slug.toLowerCase().replace(/-/g, " ");
    const sRegion = site.region.toLowerCase();
    return q.includes(sName) || q.includes(sSlug) || (q.includes(sRegion.split(",")[0].trim().toLowerCase()) && sRegion.length > 3);
  });

  if (matchedSite) {
    const feeText = matchedSite.priceInr === 0 ? "Free entry" : `₹${matchedSite.priceInr} for Indian citizens`;
    const timingText = matchedSite.openHours ? `Open hours: ${matchedSite.openHours}.` : "Open daily.";

    return `${matchedSite.name} located in ${matchedSite.region} is one of India's most celebrated heritage destinations. ${matchedSite.summary} ${timingText} Entry fee is ${feeText}. You can view real-time crowd forecasts and book certified ASI guides directly in our portal.`;
  }

  // 3. Nearby / Recommendation Queries
  if (
    q.includes("near me") ||
    q.includes("where can i visit") ||
    q.includes("tourist places") ||
    q.includes("places to visit") ||
    q.includes("recommend") ||
    q.includes("destination") ||
    q.includes("trip") ||
    q.includes("itinerary")
  ) {
    return "Here are the top heritage destinations you can visit in India:\n\n" +
      "• Northern Circuit: Taj Mahal & Agra Fort (Agra), Amber Fort & Hawa Mahal (Jaipur), Qutub Minar & Humayun's Tomb (Delhi).\n" +
      "• Southern Circuit: The UNESCO ruins of Hampi, Mysore Palace (Mysuru), and Mahabalipuram shore temples.\n" +
      "• Western Circuit: Ancient rock-cut caves of Ajanta & Ellora (Maharashtra), Mehrangarh Fort (Jodhpur).\n" +
      "• Eastern & Spiritual: Varanasi Ghats (UP), Jagannath Temple & Konark Sun Temple (Odisha).\n\n" +
      "Tip: Check the Interactive Map tab to view live crowd telemetry and find the best time of day to visit!";
  }

  // 4. Guide Verification Queries
  if (q.includes("guide") || q.includes("asi") || q.includes("license") || q.includes("book guide")) {
    return "All guides listed on Heritage India are officially verified with Archaeological Survey of India (ASI) badges. Rates are standardized between ₹400 and ₹600 per hour with no hidden commissions. You can verify guide licenses and view verified reviews on the Guide Verification page.";
  }

  // 5. Ticket & Pricing Queries
  if (q.includes("ticket") || q.includes("price") || q.includes("entry fee") || q.includes("cost") || q.includes("booking")) {
    return "Entry fees across Indian heritage sites vary from free public entry (such as the Golden Temple and Varanasi Ghats) to ₹20-₹600 for standard ASI protected monuments like Taj Mahal, Qutub Minar, and Amber Fort. You can view transparent rate sheets and book electronic tickets directly on our Pricing page.";
  }

  // 6. Crowd / Timing Queries
  if (q.includes("crowd") || q.includes("time") || q.includes("rush") || q.includes("when to visit") || q.includes("hours")) {
    return "To avoid peak crowds at popular monuments (like the Taj Mahal and Amber Fort), we recommend visiting early in the morning between 6:00 AM and 8:30 AM, or during late afternoon after 4:00 PM. Our Live Crowd Gauge tracks hourly sensor and telemetry data to suggest alternative quiet hours.";
  }

  // 7. General Greetings & Default
  if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("namaste") || q.length < 10) {
    return "Namaste! I am your AI Heritage Concierge. I can help you discover tourist destinations across India, check live crowd gauges, verify certified ASI guides, and plan visits to iconic monuments like the Taj Mahal, Hampi, Amber Fort, and 40+ other historical sites. What destination or question would you like help with?";
  }

  return `I would be delighted to help you explore India's heritage. You can ask me about tourist destinations in any region, live crowd conditions, entrance tickets, or certified ASI guides for monuments like the Taj Mahal, Hampi, Qutub Minar, and many more. Where are you planning to travel?`;
}
