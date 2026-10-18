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
  crowdPercent?: number;
}

const sites = nearbySitesRaw as CatalogSite[];

export function generateConciergeResponse(query: string, lang = "en"): string {
  const q = query.toLowerCase().trim();

  // 1. Hindi Greeting & Responses
  if (lang === "hi" || /[\u0900-\u097F]/.test(query)) {
    if (q.includes("नमस्ते") || q.includes("हेलो") || q.includes("hi") || q.includes("hello")) {
      return "नमस्ते! मैं आपका हेरिटेज टूरिस्ट असिस्टेंट हूँ। मैं आपको भारत के प्रमुख ऐतिहासिक स्थलों, लाइव भीड़ स्तर, प्रवेश टिकट और एएसआई प्रमाणित गाइडों की जानकारी दे सकता हूँ। आप किस स्थान या शहर के बारे में जानना चाहते हैं?";
    }
    if (q.includes("शांत") || q.includes("कम भीड़") || q.includes("quiet")) {
      return "यदि आप शांतिपूर्ण और कम भीड़ वाले ऐतिहासिक स्थल देखना चाहते हैं, तो साँची स्तूप (मध्य प्रदेश), मांडू के खंडहर, हम्पी के बाहरी मंदिर, और चेरापूंजी के लिविंग रूट ब्रिज बेहतरीन विकल्प हैं। यहाँ आप बिना किसी भागदौड़ के सुकून से वास्तुकला का आनंद ले सकते हैं।";
    }
    if (q.includes("कहाँ") || q.includes("घूम") || q.includes("स्थान") || q.includes("tourist")) {
      return "भारत में घूमने के लिए कई अद्भुत स्थल हैं! उत्तर में ताजमहल (आगरा), आमेर किला (जयपुर), कुतुब मीनार (दिल्ली); दक्षिण में हम्पी और मैसूर पैलेस; पूर्व में कोणार्क सूर्य मंदिर और पश्चिम में अजंता-एलोरा की गुफाएँ। आप हमारे 'Explore' पेज पर लाइव भीड़ का स्तर भी देख सकते हैं।";
    }
    return `भारत के ऐतिहासिक धरोहरों के बारे में पूछने के लिए धन्यवाद। ताजमहल, कुतुब मीनार, हम्पी या आमेर किले जैसे किसी भी स्मारक की टिकट, समय या भीड़ के बारे में पूछें, मैं आपकी पूरी सहायता करूँगा!`;
  }

  // 2. Specific Suggestion: "Show quiet sites nearby" / "quiet" / "peaceful"
  if (
    q.includes("quiet") ||
    q.includes("peaceful") ||
    q.includes("less crowd") ||
    q.includes("avoid crowd") ||
    q.includes("offbeat") ||
    q.includes("tranquil")
  ) {
    return "Here are the most serene, low-crowd heritage destinations currently recommended:\n\n" +
      "1. Sanchi Stupa (Madhya Pradesh) — Ancient Buddhist complex with pristine green lawns and minimal crowd density (~20-25%).\n" +
      "2. Mandu (Madhya Pradesh) — Romantic medieval Afghan ruins and Roopmati Pavilion overlooking the Narmada valley (~15-20% crowd).\n" +
      "3. Living Root Bridges (Cherrapunji, Meghalaya) — UNESCO natural heritage nestled deep in subtropical rainforests (~15% crowd).\n" +
      "4. Outer Temples of Hampi (Karnataka) — While the main bazaar is busy, sites like Achyutaraya and Vitthala temple banks offer quiet, majestic exploration.\n\n" +
      "Pro-Tip: For popular monuments like the Taj Mahal or Amber Fort, visiting right at sunrise (6:00 AM – 7:30 AM) guarantees a quiet, unhurried experience.";
  }

  // 3. Specific Suggestion: "What is the dress code?"
  if (
    q.includes("dress code") ||
    q.includes("dress") ||
    q.includes("clothes") ||
    q.includes("wear") ||
    q.includes("clothing") ||
    q.includes("attire")
  ) {
    return "Heritage & Temple Dress Etiquette across India:\n\n" +
      "• General Monuments (Forts, Palaces, Ruins): Comfortable casual clothing is appropriate. Lightweight cotton is recommended for daytime heat, along with comfortable walking shoes for uneven stone terrain.\n" +
      "• Sacred Sites & Temples (e.g., Khajuraho temples, Varanasi Ghats, Jagannath Temple): Modest attire is required. Shoulders and knees must be covered (avoid sleeveless tops and short shorts).\n" +
      "• Footwear: You will need to remove shoes before entering inner sanctums and marble platforms (like the main Taj Mahal terrace). Shoe covers are available at ticket gates, or bring slip-on shoes with socks for hot marble stones.\n" +
      "• Religious Gurdwaras & Mosques: Head coverings (scarves, dupattas, or handkerchiefs) are mandatory upon entering.";
  }

  // 4. Specific Suggestion: "Book a historian" / "historian" / "guide"
  if (
    q.includes("historian") ||
    q.includes("guide") ||
    q.includes("asi") ||
    q.includes("license") ||
    q.includes("book guide")
  ) {
    return "You can book certified Archaeological Survey of India (ASI) historians directly through Heritage India:\n\n" +
      "• Verified Credentials: All official guides hold verified ASI license badges with rigorous background checks.\n" +
      "• Transparent Pricing: Standardized rates from ₹400 to ₹600 per hour with zero commission markup.\n" +
      "• Specialized Expertise: Choose historians specializing in Mughal architecture, Dravidian temple art, or Indo-Islamic antiquity.\n" +
      "• Multilingual Support: Guides are available in English, Hindi, Spanish, French, German, and Japanese.\n\n" +
      "Visit our 'Guide Verification' section to view verified profiles, license IDs, and guest reviews.";
  }

  // 5. Specific Monument Matching
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

  // 6. Nearby / Recommendation Queries
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

  // 7. Ticket & Pricing Queries
  if (q.includes("ticket") || q.includes("price") || q.includes("entry fee") || q.includes("cost") || q.includes("booking")) {
    return "Entry fees across Indian heritage sites vary from free public entry (such as the Golden Temple and Varanasi Ghats) to ₹20-₹600 for standard ASI protected monuments like Taj Mahal, Qutub Minar, and Amber Fort. You can view transparent rate sheets and book electronic tickets directly on our Pricing page.";
  }

  // 8. General Greetings & Default
  if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("namaste") || q.length < 10) {
    return "Namaste! I am your AI Heritage Concierge. I can help you discover tourist destinations across India, check live crowd gauges, verify certified ASI guides, and plan visits to iconic monuments like the Taj Mahal, Hampi, Amber Fort, and 40+ other historical sites. What destination or question would you like help with?";
  }

  return `I would be delighted to help you explore India's heritage. You can ask me about tourist destinations in any region, live crowd conditions, entrance tickets, dress codes, or certified ASI guides for monuments like the Taj Mahal, Hampi, Qutub Minar, and many more. Where are you planning to travel?`;
}
