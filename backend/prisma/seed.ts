/**
 * Seed script for Heritage India database.
 * Creates 15 Indian heritage sites, 12+ guides, multilingual content,
 * demo users, bookings, and notifications.
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";
import { hashSync } from "bcryptjs";

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Sites (15 Indian Heritage Sites) ──────────────────────────

const sites = [
  {
    slug: "taj-mahal",
    name: "Taj Mahal",
    city: "Agra",
    state: "Uttar Pradesh",
    category: "Monument",
    lat: 27.1751,
    lng: 78.0421,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/7/74/Taj_Mahal%2C_Agra%2C_India_edit2.jpg"
    ]),
    entryFeeINR: 1100,
    openingHours: "6:00 AM – 6:30 PM (Closed Fridays)",
    baseCapacity: 40000,
  },
  {
    slug: "hampi",
    name: "Hampi",
    city: "Hampi",
    state: "Karnataka",
    category: "Ruins",
    lat: 15.335,
    lng: 76.46,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/0/0e/Hampi_vibread.jpg"
    ]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 6:00 PM",
    baseCapacity: 5000,
  },
  {
    slug: "amber-fort",
    name: "Amber Fort",
    city: "Jaipur",
    state: "Rajasthan",
    category: "Fort",
    lat: 26.9855,
    lng: 75.8513,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/The_Amer_Fort.jpg"
    ]),
    entryFeeINR: 500,
    openingHours: "8:00 AM – 5:30 PM",
    baseCapacity: 15000,
  },
  {
    slug: "qutub-minar",
    name: "Qutub Minar",
    city: "New Delhi",
    state: "Delhi",
    category: "Monument",
    lat: 28.5245,
    lng: 77.1855,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/0/0b/Qutab_Minar_mbread.jpg"
    ]),
    entryFeeINR: 600,
    openingHours: "7:00 AM – 5:00 PM",
    baseCapacity: 10000,
  },
  {
    slug: "mysore-palace",
    name: "Mysore Palace",
    city: "Mysuru",
    state: "Karnataka",
    category: "Palace",
    lat: 12.3052,
    lng: 76.6552,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/a/aa/Mysore_Palace_Morning.jpg"
    ]),
    entryFeeINR: 200,
    openingHours: "10:00 AM – 5:30 PM",
    baseCapacity: 8000,
  },
  {
    slug: "red-fort",
    name: "Red Fort",
    city: "New Delhi",
    state: "Delhi",
    category: "Fort",
    lat: 28.6562,
    lng: 77.241,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/d/d5/Red_Fort_in_Delhi_03-2016_img3.jpg"
    ]),
    entryFeeINR: 600,
    openingHours: "9:30 AM – 4:30 PM (Closed Mondays)",
    baseCapacity: 20000,
  },
  {
    slug: "konark-sun-temple",
    name: "Konark Sun Temple",
    city: "Konark",
    state: "Odisha",
    category: "Temple",
    lat: 19.8876,
    lng: 86.0945,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Konark_Sun_Temple_Front_view.jpg"
    ]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 8:00 PM",
    baseCapacity: 5000,
  },
  {
    slug: "meenakshi-temple",
    name: "Meenakshi Amman Temple",
    city: "Madurai",
    state: "Tamil Nadu",
    category: "Temple",
    lat: 9.9195,
    lng: 78.1193,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Meenakshi_Amman_Temple.jpg"
    ]),
    entryFeeINR: 0,
    openingHours: "5:00 AM – 12:30 PM, 4:00 PM – 9:30 PM",
    baseCapacity: 15000,
  },
  {
    slug: "khajuraho",
    name: "Khajuraho Temples",
    city: "Khajuraho",
    state: "Madhya Pradesh",
    category: "Temple",
    lat: 24.8318,
    lng: 79.9199,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/3/3f/Khajuraho_-_Kandariya_Mahadeo_Temple.jpg"
    ]),
    entryFeeINR: 600,
    openingHours: "Sunrise – Sunset",
    baseCapacity: 3000,
  },
  {
    slug: "ajanta-caves",
    name: "Ajanta Caves",
    city: "Aurangabad",
    state: "Maharashtra",
    category: "Caves",
    lat: 20.5519,
    lng: 75.7033,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/f/ff/Ajanta_%28Caves_overview%29.jpg"
    ]),
    entryFeeINR: 600,
    openingHours: "9:00 AM – 5:00 PM (Closed Mondays)",
    baseCapacity: 3000,
  },
  {
    slug: "ellora-caves",
    name: "Ellora Caves",
    city: "Aurangabad",
    state: "Maharashtra",
    category: "Caves",
    lat: 20.0258,
    lng: 75.1781,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/c/c3/Kailasha_temple_at_Ellora.jpg"
    ]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 6:00 PM (Closed Tuesdays)",
    baseCapacity: 4000,
  },
  {
    slug: "fatehpur-sikri",
    name: "Fatehpur Sikri",
    city: "Agra",
    state: "Uttar Pradesh",
    category: "Monument",
    lat: 27.0945,
    lng: 77.661,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Fatehput_Sikiri_Buland_Darwaza_gate.jpg"
    ]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 6:00 PM",
    baseCapacity: 8000,
  },
  {
    slug: "hawa-mahal",
    name: "Hawa Mahal",
    city: "Jaipur",
    state: "Rajasthan",
    category: "Palace",
    lat: 26.9239,
    lng: 75.8267,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/f/f5/Hawa_Mahal_2011.jpg"
    ]),
    entryFeeINR: 200,
    openingHours: "9:00 AM – 4:30 PM",
    baseCapacity: 5000,
  },
  {
    slug: "golconda-fort",
    name: "Golconda Fort",
    city: "Hyderabad",
    state: "Telangana",
    category: "Fort",
    lat: 17.3833,
    lng: 78.4011,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/9/93/Golconda_fort_Hyderabad.jpg"
    ]),
    entryFeeINR: 300,
    openingHours: "8:00 AM – 5:30 PM",
    baseCapacity: 6000,
  },
  {
    slug: "charminar",
    name: "Charminar",
    city: "Hyderabad",
    state: "Telangana",
    category: "Monument",
    lat: 17.3616,
    lng: 78.4747,
    imageUrls: JSON.stringify([
      "https://upload.wikimedia.org/wikipedia/commons/7/71/Charminar_Hyderabad_1.jpg"
    ]),
    entryFeeINR: 300,
    openingHours: "9:30 AM – 5:30 PM",
    baseCapacity: 4000,
  },
];

// ─── Site Content (English, Hindi, Spanish) ─────────────────────

const siteContentMap: Record<string, Record<string, { history: string; significance: string; tips: string }>> = {
  "taj-mahal": {
    en: {
      history: "Built between 1632 and 1653 by Mughal emperor Shah Jahan in memory of his wife Mumtaz Mahal. Over 20,000 artisans from across the empire and Central Asia worked on this ivory-white marble mausoleum.",
      significance: "UNESCO World Heritage Site and one of the New Seven Wonders of the World. Represents the pinnacle of Mughal architecture combining Persian, Islamic, and Indian styles.",
      tips: "Visit at sunrise for fewer crowds and magical light. Entry from the South Gate is usually fastest. Photography is allowed in gardens but not inside the mausoleum."
    },
    hi: {
      history: "1632 से 1653 के बीच मुगल सम्राट शाहजहाँ ने अपनी पत्नी मुमताज़ महल की याद में इसे बनवाया। पूरे साम्राज्य और मध्य एशिया से 20,000 से अधिक कारीगरों ने इस हाथीदांत-सफेद संगमरमर के मकबरे पर काम किया।",
      significance: "यूनेस्को विश्व धरोहर स्थल और विश्व के नए सात अजूबों में से एक। फ़ारसी, इस्लामी और भारतीय शैलियों के मिश्रण के साथ मुगल वास्तुकला की पराकाष्ठा को दर्शाता है।",
      tips: "कम भीड़ और जादुई रोशनी के लिए सूर्योदय के समय जाएँ। दक्षिण गेट से प्रवेश आमतौर पर सबसे तेज़ होता है। बगीचों में फ़ोटोग्राफ़ी की अनुमति है लेकिन मकबरे के अंदर नहीं।"
    },
    es: {
      history: "Construido entre 1632 y 1653 por el emperador mogol Shah Jahan en memoria de su esposa Mumtaz Mahal. Más de 20.000 artesanos de todo el imperio y Asia Central trabajaron en este mausoleo de mármol blanco marfil.",
      significance: "Patrimonio de la Humanidad por la UNESCO y una de las Nuevas Siete Maravillas del Mundo. Representa la cúspide de la arquitectura mogol combinando estilos persas, islámicos e indios.",
      tips: "Visite al amanecer para menos multitudes y luz mágica. La entrada por la Puerta Sur suele ser la más rápida. Se permite fotografía en los jardines pero no dentro del mausoleo."
    }
  },
  "hampi": {
    en: {
      history: "Capital of the Vijayanagara Empire from the 14th to 16th centuries. At its peak, it was one of the largest and richest cities in the world, with half a million inhabitants.",
      significance: "UNESCO World Heritage Site with over 1,600 surviving remains including forts, temples, and aquatic structures. Demonstrates the ingenuity of Vijayanagara's urban planning.",
      tips: "Hire a bicycle to explore the spread-out ruins. The Vittala Temple with its musical pillars is a must-see. Carry water and sunscreen as shade is limited."
    },
    hi: {
      history: "14वीं से 16वीं शताब्दी तक विजयनगर साम्राज्य की राजधानी। अपने चरम पर, यह दुनिया के सबसे बड़े और सबसे समृद्ध शहरों में से एक था, जिसमें आधा मिलियन निवासी थे।",
      significance: "यूनेस्को विश्व धरोहर स्थल जिसमें किले, मंदिर और जल संरचनाओं सहित 1,600 से अधिक शेष अवशेष हैं।",
      tips: "फैले हुए खंडहरों का पता लगाने के लिए साइकिल किराए पर लें। संगीतमय स्तंभों वाला विट्ठल मंदिर ज़रूर देखें।"
    },
    es: {
      history: "Capital del Imperio Vijayanagara del siglo XIV al XVI. En su apogeo, fue una de las ciudades más grandes y ricas del mundo, con medio millón de habitantes.",
      significance: "Patrimonio de la Humanidad por la UNESCO con más de 1.600 restos, incluyendo fuertes, templos y estructuras acuáticas.",
      tips: "Alquile una bicicleta para explorar las ruinas extendidas. El Templo Vittala con sus pilares musicales es imprescindible."
    }
  },
  "amber-fort": {
    en: {
      history: "Built in 1592 by Raja Man Singh I, this fort-palace complex blends Hindu and Mughal architectural styles. It served as the capital of the Kachwaha clan until Jaipur was founded.",
      significance: "Part of the Rajasthan Hill Forts UNESCO World Heritage cluster. The Sheesh Mahal (Mirror Palace) is considered one of the finest examples of mirror-work in India.",
      tips: "Arrive early to beat the crowds. The elephant rides are controversial — consider walking instead. The light-and-sound show in the evening is recommended."
    },
    hi: {
      history: "1592 में राजा मान सिंह प्रथम द्वारा निर्मित, यह किला-महल परिसर हिंदू और मुगल वास्तुकला शैलियों का मिश्रण है।",
      significance: "राजस्थान हिल फोर्ट्स यूनेस्को विश्व धरोहर समूह का हिस्सा। शीश महल को भारत में दर्पण कार्य के बेहतरीन उदाहरणों में से एक माना जाता है।",
      tips: "भीड़ से बचने के लिए जल्दी पहुँचें। हाथी की सवारी विवादास्पद है — इसके बजाय पैदल चलने पर विचार करें।"
    },
    es: {
      history: "Construido en 1592 por Raja Man Singh I, este complejo de fuerte-palacio mezcla estilos arquitectónicos hindúes y mogoles.",
      significance: "Parte del conjunto Patrimonio de la Humanidad de Fuertes de las Colinas de Rajasthan. El Sheesh Mahal se considera uno de los mejores ejemplos de trabajo de espejos en India.",
      tips: "Llegue temprano para evitar las multitudes. Los paseos en elefante son controvertidos — considere caminar en su lugar."
    }
  },
  "qutub-minar": {
    en: {
      history: "Construction began in 1193 by Qutb-ud-din Aibak and was completed by his successor Iltutmish. At 72.5 meters, it is the tallest brick minaret in the world.",
      significance: "UNESCO World Heritage Site. The surrounding Qutb complex includes the Iron Pillar of Delhi, which has resisted rust for over 1,600 years.",
      tips: "Photography is excellent in the afternoon light. The complex is compact and can be explored in 1-2 hours. Combine with a visit to Mehrauli Archaeological Park nearby."
    },
    hi: {
      history: "निर्माण 1193 में कुतुबुद्दीन ऐबक द्वारा शुरू किया गया और उनके उत्तराधिकारी इल्तुतमिश द्वारा पूरा किया गया। 72.5 मीटर पर, यह दुनिया की सबसे ऊंची ईंट की मीनार है।",
      significance: "यूनेस्को विश्व धरोहर स्थल। आसपास के कुतुब परिसर में दिल्ली का लौह स्तंभ शामिल है, जिसने 1,600 से अधिक वर्षों तक जंग का प्रतिरोध किया है।",
      tips: "दोपहर की रोशनी में फ़ोटोग्राफ़ी उत्कृष्ट है। परिसर कॉम्पैक्ट है और 1-2 घंटे में खोजा जा सकता है।"
    },
    es: {
      history: "La construcción comenzó en 1193 por Qutb-ud-din Aibak y fue completada por su sucesor Iltutmish. Con 72,5 metros, es el minarete de ladrillo más alto del mundo.",
      significance: "Patrimonio de la Humanidad por la UNESCO. El complejo Qutb incluye el Pilar de Hierro de Delhi, que ha resistido la oxidación durante más de 1.600 años.",
      tips: "La fotografía es excelente con la luz de la tarde. El complejo es compacto y puede explorarse en 1-2 horas."
    }
  },
  "mysore-palace": {
    en: {
      history: "The current palace was built between 1897 and 1912 after the previous wooden palace burned down. Designed by British architect Henry Irwin in the Indo-Saracenic style.",
      significance: "India's most visited monument, attracting over 6 million visitors annually. The palace's illumination with 97,000 light bulbs during Dasara is world-famous.",
      tips: "Cameras are not allowed inside. Visit on a Sunday evening or during Dasara (September-October) to see the palace illuminated. Carry socks as shoes must be removed."
    },
    hi: {
      history: "वर्तमान महल 1897 और 1912 के बीच बनाया गया था, जब पिछला लकड़ी का महल जलकर खाक हो गया। ब्रिटिश वास्तुकार हेनरी इरविन द्वारा इंडो-सारासेनिक शैली में डिज़ाइन किया गया।",
      significance: "भारत का सबसे अधिक दौरा किया जाने वाला स्मारक, जो सालाना 6 मिलियन से अधिक आगंतुकों को आकर्षित करता है।",
      tips: "अंदर कैमरे की अनुमति नहीं है। रविवार की शाम या दशहरे के दौरान जाएँ। जूते उतारने होंगे इसलिए मोज़े ले जाएँ।"
    },
    es: {
      history: "El palacio actual fue construido entre 1897 y 1912 después de que el palacio anterior de madera se incendiara. Diseñado por el arquitecto británico Henry Irwin en estilo indo-sarraceno.",
      significance: "El monumento más visitado de India, con más de 6 millones de visitantes anuales. Su iluminación con 97.000 bombillas durante Dasara es mundialmente famosa.",
      tips: "No se permiten cámaras dentro. Visite un domingo por la noche o durante Dasara para ver el palacio iluminado."
    }
  },
  "red-fort": {
    en: {
      history: "Built by Mughal emperor Shah Jahan in 1639 as the palace of his new capital Shahjahanabad. The massive red sandstone walls extend for 2 km.",
      significance: "UNESCO World Heritage Site. The Prime Minister hoists the national flag here every Independence Day. Symbol of India's sovereignty.",
      tips: "Allow 2-3 hours for a thorough visit. The museum inside houses Mughal artefacts. Avoid Mondays when it's closed."
    },
    hi: {
      history: "1639 में मुगल सम्राट शाहजहाँ ने अपनी नई राजधानी शाहजहानाबाद के महल के रूप में इसे बनवाया। विशाल लाल बलुआ पत्थर की दीवारें 2 किमी तक फैली हुई हैं।",
      significance: "यूनेस्को विश्व धरोहर स्थल। प्रधानमंत्री हर स्वतंत्रता दिवस पर यहाँ राष्ट्रीय ध्वज फहराते हैं।",
      tips: "पूरी यात्रा के लिए 2-3 घंटे दें। अंदर का संग्रहालय मुगल कलाकृतियों को प्रदर्शित करता है। सोमवार को बंद रहता है।"
    },
    es: {
      history: "Construido por el emperador mogol Shah Jahan en 1639 como palacio de su nueva capital Shahjahanabad. Las enormes murallas de arenisca roja se extienden por 2 km.",
      significance: "Patrimonio de la Humanidad. El Primer Ministro iza la bandera nacional aquí cada Día de la Independencia.",
      tips: "Reserve 2-3 horas para una visita completa. El museo interior alberga artefactos mogoles. Evite los lunes cuando está cerrado."
    }
  },
  "konark-sun-temple": {
    en: {
      history: "Built in the 13th century by King Narasimhadeva I of the Eastern Ganga dynasty. Designed as a colossal chariot of the Sun God with 24 intricately carved wheels.",
      significance: "UNESCO World Heritage Site. A masterpiece of Kalinga architecture and the most iconic representation of Indian temple art.",
      tips: "Best visited with a guide who can explain the intricate carvings. The interpretation centre near the entrance is excellent. Morning light is best for photography."
    },
    hi: {
      history: "13वीं शताब्दी में पूर्वी गंग वंश के राजा नरसिंहदेव प्रथम द्वारा निर्मित। सूर्य देव के विशाल रथ के रूप में 24 जटिल नक्काशीदार पहियों के साथ डिज़ाइन किया गया।",
      significance: "यूनेस्को विश्व धरोहर स्थल। कलिंग वास्तुकला की उत्कृष्ट कृति।",
      tips: "जटिल नक्काशियों को समझाने वाले गाइड के साथ जाना सबसे अच्छा है। सुबह की रोशनी फ़ोटोग्राफ़ी के लिए सबसे अच्छी है।"
    },
    es: {
      history: "Construido en el siglo XIII por el Rey Narasimhadeva I de la dinastía Ganga Oriental. Diseñado como un colosal carro del Dios Sol con 24 ruedas intrincadamente talladas.",
      significance: "Patrimonio de la Humanidad. Una obra maestra de la arquitectura Kalinga.",
      tips: "Mejor visitarlo con un guía que pueda explicar las tallas. La luz de la mañana es mejor para la fotografía."
    }
  },
  "meenakshi-temple": {
    en: {
      history: "Originally built in the 6th century and rebuilt by Thirumalai Nayak in the 17th century. The temple complex spans 14 acres with 14 gopurams (gateway towers) covered in thousands of colourful sculptures.",
      significance: "One of India's most important Hindu temples, dedicated to Meenakshi (a form of Parvati) and Sundareswarar (Shiva). Nominated for the New Seven Wonders of the World.",
      tips: "Free entry. No photography inside. Visit early morning for a quieter experience. The temple pond and Hall of a Thousand Pillars are highlights."
    },
    hi: {
      history: "मूल रूप से 6वीं शताब्दी में निर्मित और 17वीं शताब्दी में तिरुमलई नायक द्वारा पुनर्निर्मित। 14 एकड़ में फैला मंदिर परिसर हज़ारों रंगीन मूर्तियों से सजे 14 गोपुरम के साथ।",
      significance: "भारत के सबसे महत्वपूर्ण हिंदू मंदिरों में से एक, मीनाक्षी (पार्वती का एक रूप) और सुंदरेश्वर (शिव) को समर्पित।",
      tips: "प्रवेश निःशुल्क है। अंदर फ़ोटोग्राफ़ी की अनुमति नहीं है। शांत अनुभव के लिए सुबह जल्दी जाएँ।"
    },
    es: {
      history: "Originalmente construido en el siglo VI y reconstruido por Thirumalai Nayak en el XVII. El complejo abarca 14 acres con 14 gopurams cubiertos de miles de esculturas coloridas.",
      significance: "Uno de los templos hindúes más importantes de India, dedicado a Meenakshi y Sundareswarar.",
      tips: "Entrada gratuita. Sin fotografía dentro. Visite temprano en la mañana para una experiencia más tranquila."
    }
  },
  "khajuraho": {
    en: {
      history: "Built between 950 and 1050 CE by the Chandela dynasty. Of the original 85 temples, only 25 survive today, famous for their erotic and intricate sculptural art.",
      significance: "UNESCO World Heritage Site. The temples represent the artistic and architectural achievement of medieval India at its finest.",
      tips: "The Western group is the most impressive and well-maintained. The light-and-sound show is highly recommended. Best visited from October to March."
    },
    hi: {
      history: "950 और 1050 ई. के बीच चंदेल राजवंश द्वारा निर्मित। मूल 85 मंदिरों में से केवल 25 आज बचे हैं, जो अपनी शृंगारिक और जटिल मूर्तिकला कला के लिए प्रसिद्ध हैं।",
      significance: "यूनेस्को विश्व धरोहर स्थल। ये मंदिर मध्यकालीन भारत की कलात्मक और वास्तुशिल्प उपलब्धि का प्रतिनिधित्व करते हैं।",
      tips: "पश्चिमी समूह सबसे प्रभावशाली है। लाइट एंड साउंड शो की अत्यधिक अनुशंसा की जाती है।"
    },
    es: {
      history: "Construidos entre 950 y 1050 d.C. por la dinastía Chandela. De los 85 templos originales, solo sobreviven 25, famosos por su arte escultórico erótico e intrincado.",
      significance: "Patrimonio de la Humanidad. Los templos representan el logro artístico y arquitectónico de la India medieval.",
      tips: "El grupo occidental es el más impresionante. El espectáculo de luz y sonido es muy recomendable."
    }
  },
  "ajanta-caves": {
    en: {
      history: "Carved between the 2nd century BCE and 6th century CE, these 30 rock-cut Buddhist caves contain the finest examples of ancient Indian mural paintings.",
      significance: "UNESCO World Heritage Site. The murals depict Jataka tales and are considered masterpieces of Buddhist religious art with universal significance.",
      tips: "Closed on Mondays. Carry a torch/flashlight for the darker caves. Best combined with a visit to Ellora (100 km away). Hire a guide for the story behind the paintings."
    },
    hi: {
      history: "दूसरी शताब्दी ईसा पूर्व और 6वीं शताब्दी ई. के बीच उकेरी गई, ये 30 चट्टान-कटी बौद्ध गुफाएँ प्राचीन भारतीय भित्ति चित्रों के बेहतरीन उदाहरण हैं।",
      significance: "यूनेस्को विश्व धरोहर स्थल। भित्ति चित्र जातक कथाओं को दर्शाते हैं और बौद्ध धार्मिक कला की उत्कृष्ट कृतियाँ मानी जाती हैं।",
      tips: "सोमवार को बंद। अंधेरी गुफाओं के लिए टॉर्च ले जाएँ। एलोरा की यात्रा के साथ जोड़ना सबसे अच्छा है।"
    },
    es: {
      history: "Talladas entre el siglo II a.C. y el VI d.C., estas 30 cuevas budistas excavadas en roca contienen los mejores ejemplos de pintura mural antigua de India.",
      significance: "Patrimonio de la Humanidad. Los murales representan cuentos Jataka y se consideran obras maestras del arte religioso budista.",
      tips: "Cerrado los lunes. Lleve una linterna para las cuevas más oscuras. Mejor combinarlo con una visita a Ellora."
    }
  },
  "ellora-caves": {
    en: {
      history: "Excavated between the 6th and 11th centuries, Ellora's 34 caves represent Buddhism, Hinduism, and Jainism, showcasing ancient India's religious harmony.",
      significance: "UNESCO World Heritage Site. Cave 16 (Kailasa Temple) is the largest monolithic rock excavation in the world, carved top-down from a single basalt cliff.",
      tips: "Closed on Tuesdays. Start with Cave 16 (Kailasa Temple) — it's the highlight. Carry water and comfortable shoes."
    },
    hi: {
      history: "6वीं और 11वीं शताब्दी के बीच उत्खनित, एलोरा की 34 गुफाएँ बौद्ध धर्म, हिंदू धर्म और जैन धर्म का प्रतिनिधित्व करती हैं।",
      significance: "यूनेस्को विश्व धरोहर स्थल। गुफा 16 (कैलास मंदिर) दुनिया की सबसे बड़ी अखंड चट्टान खुदाई है।",
      tips: "मंगलवार को बंद। गुफा 16 से शुरू करें — यह मुख्य आकर्षण है। पानी और आरामदायक जूते ले जाएँ।"
    },
    es: {
      history: "Excavadas entre los siglos VI y XI, las 34 cuevas representan budismo, hinduismo y jainismo, mostrando la armonía religiosa de la antigua India.",
      significance: "Patrimonio de la Humanidad. La Cueva 16 (Templo Kailasa) es la mayor excavación monolítica de roca del mundo.",
      tips: "Cerrado los martes. Comience con la Cueva 16 — es lo más destacado. Lleve agua y zapatos cómodos."
    }
  },
  "fatehpur-sikri": {
    en: {
      history: "Built by Mughal emperor Akbar in 1571 as his capital, then abandoned after just 14 years due to water scarcity. It remains remarkably well-preserved.",
      significance: "UNESCO World Heritage Site. A masterpiece of Mughal urban planning combining Hindu and Islamic architecture. Buland Darwaza is the highest gateway in the world at 54 metres.",
      tips: "Combine with a day trip from Agra (40 km). The Panch Mahal offers the best views. Avoid touts offering to be 'official' guides at the entrance."
    },
    hi: {
      history: "1571 में मुगल सम्राट अकबर ने अपनी राजधानी के रूप में इसे बनवाया, फिर पानी की कमी के कारण मात्र 14 वर्षों बाद इसे छोड़ दिया।",
      significance: "यूनेस्को विश्व धरोहर स्थल। बुलंद दरवाज़ा 54 मीटर पर दुनिया का सबसे ऊंचा प्रवेश द्वार है।",
      tips: "आगरा से एक दिन की यात्रा के साथ जोड़ें। पंच महल से सबसे अच्छा दृश्य मिलता है।"
    },
    es: {
      history: "Construida por el emperador mogol Akbar en 1571 como su capital, luego abandonada tras solo 14 años por escasez de agua.",
      significance: "Patrimonio de la Humanidad. El Buland Darwaza es la puerta más alta del mundo con 54 metros.",
      tips: "Combínelo con una excursión desde Agra (40 km). El Panch Mahal ofrece las mejores vistas."
    }
  },
  "hawa-mahal": {
    en: {
      history: "Built in 1799 by Maharaja Sawai Pratap Singh, this five-storey 'Palace of Winds' features 953 small windows (jharokhas) designed so royal women could observe street life without being seen.",
      significance: "The iconic pink sandstone facade is the most photographed building in Jaipur and a masterpiece of Rajput architecture.",
      tips: "Best photographed from across the street in the morning. The view from the top floor is stunning. Entry is from the rear, not the famous facade side."
    },
    hi: {
      history: "1799 में महाराजा सवाई प्रताप सिंह द्वारा निर्मित, इस पाँच मंज़िला 'हवाओं के महल' में 953 छोटी खिड़कियाँ (झरोखे) हैं जो शाही महिलाओं को बिना दिखे सड़क का जीवन देखने के लिए डिज़ाइन की गई थीं।",
      significance: "यह प्रतिष्ठित गुलाबी बलुआ पत्थर का अग्रभाग जयपुर की सबसे अधिक फ़ोटो खींची जाने वाली इमारत है।",
      tips: "सुबह सड़क के उस पार से फ़ोटो खींचना सबसे अच्छा है। ऊपरी मंज़िल से दृश्य शानदार है।"
    },
    es: {
      history: "Construido en 1799 por el Maharajá Sawai Pratap Singh, este 'Palacio de los Vientos' de cinco pisos tiene 953 pequeñas ventanas diseñadas para que las mujeres reales pudieran observar la vida callejera sin ser vistas.",
      significance: "La icónica fachada de arenisca rosa es el edificio más fotografiado de Jaipur.",
      tips: "Mejor fotografiado desde el otro lado de la calle por la mañana. La vista desde el último piso es impresionante."
    }
  },
  "golconda-fort": {
    en: {
      history: "Originally a mud fort built in the 13th century, it was expanded by the Qutb Shahi dynasty into a massive fortification with 87 bastions and an advanced acoustic warning system.",
      significance: "Famous for its acoustic engineering — a handclap at the entrance can be heard at the highest point, nearly a kilometre away. Once home to the Koh-i-Noor and Hope diamonds.",
      tips: "The climb to the top is steep but rewarding. The clapping demonstration at the entrance is a must-try. Evening sound-and-light show is excellent."
    },
    hi: {
      history: "मूल रूप से 13वीं शताब्दी में बनाया गया एक मिट्टी का किला, इसे कुतुब शाही राजवंश ने 87 बुर्जों वाले विशाल किले में विस्तारित किया।",
      significance: "अपनी ध्वनिक इंजीनियरिंग के लिए प्रसिद्ध — प्रवेश द्वार पर एक ताली लगभग एक किलोमीटर दूर सबसे ऊंचे बिंदु पर सुनी जा सकती है।",
      tips: "शीर्ष तक चढ़ाई खड़ी है लेकिन पुरस्कृत है। प्रवेश द्वार पर ताली प्रदर्शन ज़रूर आज़माएँ।"
    },
    es: {
      history: "Originalmente un fuerte de barro del siglo XIII, fue expandido por la dinastía Qutb Shahi con 87 bastiones y un sistema acústico avanzado.",
      significance: "Famoso por su ingeniería acústica — una palmada en la entrada se puede escuchar en el punto más alto, a casi un kilómetro.",
      tips: "La subida a la cima es empinada pero gratificante. La demostración de palmadas en la entrada es imprescindible."
    }
  },
  "charminar": {
    en: {
      history: "Built in 1591 by Sultan Muhammad Quli Qutb Shah to commemorate the end of a deadly plague. The four minarets symbolise the first four caliphs of Islam.",
      significance: "The iconic symbol of Hyderabad and a masterpiece of Indo-Islamic architecture. The surrounding Laad Bazaar is one of India's oldest markets.",
      tips: "Visit in the evening when it's beautifully lit. Explore Laad Bazaar for bangles and pearls. The mosque on the top floor is still in use."
    },
    hi: {
      history: "1591 में सुल्तान मुहम्मद कुली कुतुब शाह ने एक घातक प्लेग की समाप्ति की याद में इसे बनवाया। चार मीनारें इस्लाम के पहले चार ख़लीफ़ाओं का प्रतीक हैं।",
      significance: "हैदराबाद का प्रतिष्ठित प्रतीक और इंडो-इस्लामी वास्तुकला की उत्कृष्ट कृति।",
      tips: "शाम को जाएँ जब यह खूबसूरती से रोशन होता है। चूड़ियों और मोतियों के लिए लाड बाज़ार का अन्वेषण करें।"
    },
    es: {
      history: "Construido en 1591 por el Sultán Muhammad Quli Qutb Shah para conmemorar el fin de una plaga mortal. Los cuatro minaretes simbolizan los cuatro primeros califas del Islam.",
      significance: "El símbolo icónico de Hyderabad y una obra maestra de la arquitectura indo-islámica.",
      tips: "Visite por la noche cuando está bellamente iluminado. Explore Laad Bazaar para brazaletes y perlas."
    }
  }
};

// ─── Guides (12+ with mix of verified and unverified) ───────────

const guides = [
  { name: "Rajesh Kumar", licenseId: "ASI-RAJ-001", licenseStatus: "VERIFIED", experienceYears: 12, languages: JSON.stringify(["English", "Hindi", "Urdu"]), ratePerHourINR: 800, standardRateINR: 500, photoUrl: null },
  { name: "Priya Sharma", licenseId: "ASI-PRI-002", licenseStatus: "VERIFIED", experienceYears: 8, languages: JSON.stringify(["English", "Hindi"]), ratePerHourINR: 700, standardRateINR: 500, photoUrl: null },
  { name: "Arun Nair", licenseId: "ASI-ARN-003", licenseStatus: "VERIFIED", experienceYears: 15, languages: JSON.stringify(["English", "Hindi", "Malayalam", "Tamil"]), ratePerHourINR: 1000, standardRateINR: 500, photoUrl: null },
  { name: "Meera Devi", licenseId: "ASI-MEE-004", licenseStatus: "VERIFIED", experienceYears: 6, languages: JSON.stringify(["English", "Hindi", "Rajasthani"]), ratePerHourINR: 600, standardRateINR: 500, photoUrl: null },
  { name: "Vikram Singh", licenseId: "ASI-VIK-005", licenseStatus: "VERIFIED", experienceYears: 20, languages: JSON.stringify(["English", "Hindi", "French"]), ratePerHourINR: 1200, standardRateINR: 500, photoUrl: null },
  { name: "Lakshmi Iyer", licenseId: "ASI-LAK-006", licenseStatus: "VERIFIED", experienceYears: 10, languages: JSON.stringify(["English", "Hindi", "Tamil", "Kannada"]), ratePerHourINR: 750, standardRateINR: 500, photoUrl: null },
  { name: "Mohammed Farooq", licenseId: "ASI-MOH-007", licenseStatus: "VERIFIED", experienceYears: 14, languages: JSON.stringify(["English", "Hindi", "Urdu", "Arabic"]), ratePerHourINR: 900, standardRateINR: 500, photoUrl: null },
  { name: "Sunita Patil", licenseId: "ASI-SUN-008", licenseStatus: "VERIFIED", experienceYears: 7, languages: JSON.stringify(["English", "Hindi", "Marathi"]), ratePerHourINR: 650, standardRateINR: 500, photoUrl: null },
  { name: "Deepak Reddy", licenseId: "ASI-DEE-009", licenseStatus: "VERIFIED", experienceYears: 11, languages: JSON.stringify(["English", "Hindi", "Telugu"]), ratePerHourINR: 800, standardRateINR: 500, photoUrl: null },
  { name: "Anita Joshi", licenseId: "ASI-ANI-010", licenseStatus: "VERIFIED", experienceYears: 9, languages: JSON.stringify(["English", "Hindi", "Gujarati"]), ratePerHourINR: 700, standardRateINR: 500, photoUrl: null },
  { name: "Ravi Teja", licenseId: "UNLIC-RAV-011", licenseStatus: "UNVERIFIED", experienceYears: 3, languages: JSON.stringify(["English", "Telugu"]), ratePerHourINR: 400, standardRateINR: 500, photoUrl: null },
  { name: "Kamal Hassan", licenseId: "UNLIC-KAM-012", licenseStatus: "UNVERIFIED", experienceYears: 2, languages: JSON.stringify(["English", "Hindi", "Tamil"]), ratePerHourINR: 350, standardRateINR: 500, photoUrl: null },
  { name: "Sanjay Gupta", licenseId: "ASI-SAN-013", licenseStatus: "VERIFIED", experienceYears: 16, languages: JSON.stringify(["English", "Hindi", "Bengali"]), ratePerHourINR: 850, standardRateINR: 500, photoUrl: null },
  { name: "Fatima Begum", licenseId: "ASI-FAT-014", licenseStatus: "VERIFIED", experienceYears: 5, languages: JSON.stringify(["English", "Hindi", "Urdu"]), ratePerHourINR: 550, standardRateINR: 500, photoUrl: null },
];

async function main() {
  console.log("🌱 Seeding Heritage India database...\n");

  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedSite.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.crowdSnapshot.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.site.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Sites ───────────────────────────────────────────

  console.log("📍 Creating 15 heritage sites...");
  const createdSites: Record<string, string> = {};
  for (const siteData of sites) {
    const site = await prisma.site.create({ data: siteData });
    createdSites[site.slug] = site.id;
    console.log(`   ✓ ${site.name}`);
  }

  // ─── Create Site Content (3 locales per site) ──────────────

  console.log("\n🌐 Creating multilingual site content...");
  for (const [slug, locales] of Object.entries(siteContentMap)) {
    const siteId = createdSites[slug];
    if (!siteId) continue;
    for (const [locale, content] of Object.entries(locales)) {
      await prisma.siteContent.create({
        data: { siteId, locale, ...content }
      });
    }
    console.log(`   ✓ ${slug} (en, hi, es)`);
  }

  // ─── Create Guides ─────────────────────────────────────────

  console.log("\n🧑‍🏫 Creating guides...");
  const createdGuides: string[] = [];
  for (const guideData of guides) {
    const guide = await prisma.guide.create({ data: guideData });
    createdGuides.push(guide.id);
    console.log(`   ✓ ${guide.name} (${guide.licenseStatus})`);
  }

  // ─── Create Demo Users ─────────────────────────────────────

  console.log("\n👤 Creating demo users...");
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@heritage-india.com",
      passwordHash: hashSync("Demo@1234", 10),
      preference: {
        create: {
          theme: "dark",
          visionMode: "default",
          language: "en",
          onboardingDone: true,
        }
      }
    }
  });
  console.log(`   ✓ ${demoUser.name} (${demoUser.email})`);

  const testUser = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@heritage-india.com",
      passwordHash: hashSync("Test@1234", 10),
      preference: {
        create: {
          theme: "light",
          visionMode: "default",
          language: "hi",
          onboardingDone: true,
        }
      }
    }
  });
  console.log(`   ✓ ${testUser.name} (${testUser.email})`);

  // ─── Create Demo Bookings ──────────────────────────────────

  console.log("\n📅 Creating demo bookings...");
  const tajId = createdSites["taj-mahal"]!;
  const amberFortId = createdSites["amber-fort"]!;
  const hampiId = createdSites["hampi"]!;
  const redFortId = createdSites["red-fort"]!;

  const bookings = [
    {
      userId: demoUser.id,
      siteId: tajId,
      guideId: createdGuides[0],
      visitDate: new Date("2026-11-15"),
      partySize: 2,
      status: "UPCOMING",
      totalINR: 4000,
      reference: "HI-2026-TAJ-001",
    },
    {
      userId: demoUser.id,
      siteId: amberFortId,
      guideId: createdGuides[3],
      visitDate: new Date("2026-10-05"),
      partySize: 4,
      status: "COMPLETED",
      totalINR: 6400,
      reference: "HI-2026-AMB-002",
    },
    {
      userId: demoUser.id,
      siteId: hampiId,
      guideId: createdGuides[2],
      visitDate: new Date("2026-09-20"),
      partySize: 1,
      status: "COMPLETED",
      totalINR: 1600,
      reference: "HI-2026-HAM-003",
    },
    {
      userId: demoUser.id,
      siteId: redFortId,
      visitDate: new Date("2026-12-25"),
      partySize: 3,
      status: "UPCOMING",
      totalINR: 1800,
      reference: "HI-2026-RED-004",
    },
    {
      userId: testUser.id,
      siteId: tajId,
      guideId: createdGuides[4],
      visitDate: new Date("2026-11-20"),
      partySize: 2,
      status: "UPCOMING",
      totalINR: 4600,
      reference: "HI-2026-TAJ-005",
    },
  ];

  for (const bookingData of bookings) {
    const booking = await prisma.booking.create({ data: bookingData });

    // Create line items
    await prisma.lineItem.createMany({
      data: [
        { bookingId: booking.id, label: "Entry Fee", amountINR: Math.round(booking.totalINR * 0.55) },
        { bookingId: booking.id, label: "Guide Fee", amountINR: Math.round(booking.totalINR * 0.35) },
        { bookingId: booking.id, label: "Service Fee", amountINR: Math.round(booking.totalINR * 0.10) },
      ]
    });

    // Create payment for completed bookings
    if (booking.status === "COMPLETED") {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          method: "UPI",
          status: "SUCCESS",
          providerRef: `PAY-${booking.reference}`,
          amountINR: booking.totalINR,
        }
      });
    }

    console.log(`   ✓ ${booking.reference} (${booking.status})`);
  }

  // ─── Create Saved Sites ────────────────────────────────────

  console.log("\n❤️ Creating saved sites...");
  await prisma.savedSite.createMany({
    data: [
      { userId: demoUser.id, siteId: tajId },
      { userId: demoUser.id, siteId: createdSites["mysore-palace"]! },
      { userId: demoUser.id, siteId: createdSites["khajuraho"]! },
      { userId: testUser.id, siteId: createdSites["hawa-mahal"]! },
      { userId: testUser.id, siteId: createdSites["charminar"]! },
    ]
  });
  console.log("   ✓ 5 saved sites across 2 users");

  // ─── Create Notifications ──────────────────────────────────

  console.log("\n🔔 Creating notifications...");
  const notifications = [
    {
      userId: demoUser.id,
      type: "BOOKING",
      title: "Booking Confirmed",
      body: "Your visit to Taj Mahal on Nov 15, 2026 with guide Rajesh Kumar is confirmed. Reference: HI-2026-TAJ-001",
    },
    {
      userId: demoUser.id,
      type: "CROWD_ALERT",
      title: "Crowd Alert: Taj Mahal",
      body: "Taj Mahal is currently experiencing HIGH crowd levels (85%). Consider visiting Fatehpur Sikri instead — it's only 40 km away with LOW crowds.",
    },
    {
      userId: demoUser.id,
      type: "BOOKING",
      title: "Trip Completed",
      body: "Your visit to Amber Fort on Oct 5, 2026 is complete. We hope you enjoyed it! Rate your experience.",
    },
    {
      userId: demoUser.id,
      type: "GUIDE_VERIFICATION",
      title: "Guide Verified",
      body: "Meera Devi (ASI-MEE-004) has been verified as an ASI Licensed Guide for Jaipur region.",
    },
    {
      userId: testUser.id,
      type: "BOOKING",
      title: "Booking Confirmed",
      body: "Your visit to Taj Mahal on Nov 20, 2026 with guide Vikram Singh is confirmed. Reference: HI-2026-TAJ-005",
    },
    {
      userId: testUser.id,
      type: "CROWD_ALERT",
      title: "Good News: Low Crowds",
      body: "Hawa Mahal (one of your saved sites) currently has LOW crowd levels (22%). Great time to visit!",
    },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
    console.log(`   ✓ ${n.title}`);
  }

  // ─── Create Crowd Snapshots ────────────────────────────────

  console.log("\n📊 Creating initial crowd snapshots...");
  const crowdLevels = [
    { slug: "taj-mahal", level: "HIGH", percent: 85 },
    { slug: "hampi", level: "LOW", percent: 25 },
    { slug: "amber-fort", level: "MEDIUM", percent: 55 },
    { slug: "qutub-minar", level: "MEDIUM", percent: 48 },
    { slug: "mysore-palace", level: "HIGH", percent: 78 },
    { slug: "red-fort", level: "MEDIUM", percent: 62 },
    { slug: "konark-sun-temple", level: "LOW", percent: 18 },
    { slug: "meenakshi-temple", level: "MEDIUM", percent: 45 },
    { slug: "khajuraho", level: "LOW", percent: 22 },
    { slug: "ajanta-caves", level: "LOW", percent: 15 },
    { slug: "ellora-caves", level: "LOW", percent: 20 },
    { slug: "fatehpur-sikri", level: "LOW", percent: 30 },
    { slug: "hawa-mahal", level: "MEDIUM", percent: 52 },
    { slug: "golconda-fort", level: "LOW", percent: 28 },
    { slug: "charminar", level: "MEDIUM", percent: 58 },
  ];

  for (const { slug, level, percent } of crowdLevels) {
    const siteId = createdSites[slug];
    if (!siteId) continue;
    await prisma.crowdSnapshot.create({
      data: { siteId, level, percent }
    });
    console.log(`   ✓ ${slug}: ${level} (${percent}%)`);
  }

  // ─── Summary ───────────────────────────────────────────────

  const sitesCount = await prisma.site.count();
  const guidesCount = await prisma.guide.count();
  const contentCount = await prisma.siteContent.count();
  const usersCount = await prisma.user.count();
  const bookingsCount = await prisma.booking.count();
  const notifCount = await prisma.notification.count();

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Seed completed successfully!");
  console.log(`   Sites:         ${sitesCount}`);
  console.log(`   Guides:        ${guidesCount}`);
  console.log(`   Site Content:  ${contentCount} (${contentCount / sitesCount} locales/site)`);
  console.log(`   Users:         ${usersCount}`);
  console.log(`   Bookings:      ${bookingsCount}`);
  console.log(`   Notifications: ${notifCount}`);
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
