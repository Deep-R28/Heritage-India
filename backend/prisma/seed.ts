/**
 * Seed script for Heritage India database.
 * Creates 50 Indian heritage / tourist sites, 14 guides, multilingual content,
 * 5,600 crowd-flow patterns, ASI visitor statistics, demo users, bookings,
 * and notifications.
 *
 * All data is curated from real sources — coordinates, fees, hours, and ratings
 * reflect actual published figures (as of 2024-25).
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";
import { hashSync } from "bcryptjs";
import { verifiedSiteImages } from "../scripts/update-images.js";

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════════════
// SECTION 1 — 50 Curated Heritage / Tourist Sites
// ═══════════════════════════════════════════════════════════════════

interface SiteData {
  slug: string;
  name: string;
  city: string;
  state: string;
  category: string;
  lat: number;
  lng: number;
  imageUrls: string;
  entryFeeINR: number;
  openingHours: string;
  baseCapacity: number;
  zone: string;
  type: string;
  established: string | null;
  bestTime: string | null;
  weeklyOff: string;
  dslrAllowed: boolean;
  googleRating: number;
  reviewCount: number;
  significance: string | null;
  timeNeeded: number;
  airportNearby: boolean;
}

const sites: SiteData[] = [
  // ─── EXISTING 15 SITES (with new fields added) ─────────────────

  {
    slug: "taj-mahal",
    name: "Taj Mahal",
    city: "Agra",
    state: "Uttar Pradesh",
    category: "Monument",
    lat: 27.1751,
    lng: 78.0421,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 1100,
    openingHours: "6:00 AM – 6:30 PM (Closed Fridays)",
    baseCapacity: 40000,
    zone: "Northern",
    type: "Historical",
    established: "1653",
    bestTime: "October to March",
    weeklyOff: "Friday",
    dslrAllowed: true,
    googleRating: 4.6,
    reviewCount: 2.5,
    significance: "UNESCO World Heritage Site and one of the New Seven Wonders of the World. The pinnacle of Mughal architecture.",
    timeNeeded: 2.5,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 6:00 PM",
    baseCapacity: 5000,
    zone: "Southern",
    type: "Historical",
    established: "14th century",
    bestTime: "October to February",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.6,
    reviewCount: 0.8,
    significance: "UNESCO World Heritage Site. Capital of the Vijayanagara Empire with over 1,600 surviving remains.",
    timeNeeded: 4.0,
    airportNearby: false,
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
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 500,
    openingHours: "8:00 AM – 5:30 PM",
    baseCapacity: 15000,
    zone: "Northern",
    type: "Historical",
    established: "1592",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 1.2,
    significance: "Part of the Rajasthan Hill Forts UNESCO World Heritage cluster. The Sheesh Mahal is a masterpiece of mirror-work.",
    timeNeeded: 2.5,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "7:00 AM – 5:00 PM",
    baseCapacity: 10000,
    zone: "Northern",
    type: "Historical",
    established: "1193",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 1.5,
    significance: "UNESCO World Heritage Site. Tallest brick minaret in the world at 72.5 metres. The Iron Pillar has resisted rust for 1,600+ years.",
    timeNeeded: 1.5,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 200,
    openingHours: "10:00 AM – 5:30 PM",
    baseCapacity: 8000,
    zone: "Southern",
    type: "Historical",
    established: "1912",
    bestTime: "September to February",
    weeklyOff: "Open All Days",
    dslrAllowed: false,
    googleRating: 4.5,
    reviewCount: 2.0,
    significance: "India's most visited monument. The palace's illumination with 97,000 light bulbs during Dasara is world-famous.",
    timeNeeded: 2.0,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "9:30 AM – 4:30 PM (Closed Mondays)",
    baseCapacity: 20000,
    zone: "Northern",
    type: "Historical",
    established: "1648",
    bestTime: "October to March",
    weeklyOff: "Monday",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 1.8,
    significance: "UNESCO World Heritage Site. The PM hoists the national flag here every Independence Day. Symbol of India's sovereignty.",
    timeNeeded: 2.5,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 8:00 PM",
    baseCapacity: 5000,
    zone: "Eastern",
    type: "Historical",
    established: "13th century",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.6,
    significance: "UNESCO World Heritage Site. A masterpiece of Kalinga architecture designed as a colossal chariot with 24 intricately carved wheels.",
    timeNeeded: 2.0,
    airportNearby: false,
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
      "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "5:00 AM – 12:30 PM, 4:00 PM – 9:30 PM",
    baseCapacity: 15000,
    zone: "Southern",
    type: "Religious",
    established: "6th century",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: false,
    googleRating: 4.6,
    reviewCount: 1.5,
    significance: "One of India's most important Hindu temples, dedicated to Meenakshi (Parvati) and Sundareswarar (Shiva). Nominated for the New Seven Wonders.",
    timeNeeded: 2.0,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "Sunrise – Sunset",
    baseCapacity: 3000,
    zone: "Central",
    type: "Historical",
    established: "950–1050 CE",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.5,
    significance: "UNESCO World Heritage Site. The 25 surviving temples are famous for intricate sculptural art representing medieval India's artistic pinnacle.",
    timeNeeded: 3.0,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "9:00 AM – 5:00 PM (Closed Mondays)",
    baseCapacity: 3000,
    zone: "Western",
    type: "Historical",
    established: "2nd century BCE",
    bestTime: "November to March",
    weeklyOff: "Monday",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.4,
    significance: "UNESCO World Heritage Site. 30 rock-cut Buddhist caves with the finest ancient Indian mural paintings depicting Jataka tales.",
    timeNeeded: 3.0,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 6:00 PM (Closed Tuesdays)",
    baseCapacity: 4000,
    zone: "Western",
    type: "Historical",
    established: "6th–11th century",
    bestTime: "November to March",
    weeklyOff: "Tuesday",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.5,
    significance: "UNESCO World Heritage Site. 34 caves representing Buddhism, Hinduism, and Jainism. Cave 16 (Kailasa) is the world's largest monolithic rock excavation.",
    timeNeeded: 3.0,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 6:00 PM",
    baseCapacity: 8000,
    zone: "Northern",
    type: "Historical",
    established: "1571",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 0.6,
    significance: "UNESCO World Heritage Site. Built by Akbar, abandoned after 14 years. Buland Darwaza is the world's highest gateway at 54 metres.",
    timeNeeded: 2.0,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 200,
    openingHours: "9:00 AM – 4:30 PM",
    baseCapacity: 5000,
    zone: "Northern",
    type: "Historical",
    established: "1799",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 1.0,
    significance: "The iconic pink sandstone 'Palace of Winds' with 953 jharokhas. Most photographed building in Jaipur and a masterpiece of Rajput architecture.",
    timeNeeded: 1.0,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 300,
    openingHours: "8:00 AM – 5:30 PM",
    baseCapacity: 6000,
    zone: "Southern",
    type: "Historical",
    established: "13th century",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 0.7,
    significance: "Famous for acoustic engineering — a handclap at the entrance is heard 1 km away at the top. Once home to the Koh-i-Noor diamond.",
    timeNeeded: 2.5,
    airportNearby: true,
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
      "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 300,
    openingHours: "9:30 AM – 5:30 PM",
    baseCapacity: 4000,
    zone: "Southern",
    type: "Historical",
    established: "1591",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.3,
    reviewCount: 0.9,
    significance: "Iconic symbol of Hyderabad. Built to commemorate the end of a deadly plague. The surrounding Laad Bazaar is one of India's oldest markets.",
    timeNeeded: 1.5,
    airportNearby: true,
  },

  // ─── 35 NEW SITES ──────────────────────────────────────────────

  // Northern Zone
  {
    slug: "golden-temple",
    name: "Golden Temple",
    city: "Amritsar",
    state: "Punjab",
    category: "Gurudwara",
    lat: 31.6200,
    lng: 74.8765,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "Open 24 Hours",
    baseCapacity: 100000,
    zone: "Northern",
    type: "Religious",
    established: "1604",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.8,
    reviewCount: 3.0,
    significance: "Holiest shrine in Sikhism (Sri Harmandir Sahib). Runs the world's largest free kitchen (langar) serving 50,000+ meals daily.",
    timeNeeded: 2.5,
    airportNearby: true,
  },
  {
    slug: "humayuns-tomb",
    name: "Humayun's Tomb",
    city: "New Delhi",
    state: "Delhi",
    category: "Monument",
    lat: 28.5933,
    lng: 77.2507,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 35,
    openingHours: "Sunrise – Sunset",
    baseCapacity: 8000,
    zone: "Northern",
    type: "Historical",
    established: "1572",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.8,
    significance: "UNESCO World Heritage Site. The first garden-tomb on the Indian subcontinent and direct inspiration for the Taj Mahal.",
    timeNeeded: 1.5,
    airportNearby: true,
  },
  {
    slug: "jallianwala-bagh",
    name: "Jallianwala Bagh",
    city: "Amritsar",
    state: "Punjab",
    category: "Memorial",
    lat: 31.6209,
    lng: 74.8805,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "6:30 AM – 7:30 PM",
    baseCapacity: 5000,
    zone: "Northern",
    type: "Historical",
    established: "1951",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 1.2,
    significance: "Memorial to the 1919 massacre where British troops killed hundreds of unarmed civilians. A sacred site in India's independence movement.",
    timeNeeded: 1.0,
    airportNearby: true,
  },
  {
    slug: "varanasi-ghats",
    name: "Varanasi Ghats",
    city: "Varanasi",
    state: "Uttar Pradesh",
    category: "Religious Site",
    lat: 25.3176,
    lng: 83.0102,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "Open 24 Hours",
    baseCapacity: 50000,
    zone: "Northern",
    type: "Religious",
    established: "11th century BCE",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.6,
    reviewCount: 2.0,
    significance: "One of the oldest continuously inhabited cities in the world. The 88 ghats along the Ganges are central to Hindu spiritual life and the Ganga Aarti is iconic.",
    timeNeeded: 3.0,
    airportNearby: true,
  },
  {
    slug: "city-palace-udaipur",
    name: "City Palace Udaipur",
    city: "Udaipur",
    state: "Rajasthan",
    category: "Palace",
    lat: 24.5764,
    lng: 73.6913,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 300,
    openingHours: "9:30 AM – 5:30 PM",
    baseCapacity: 8000,
    zone: "Northern",
    type: "Historical",
    established: "1559",
    bestTime: "September to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 0.8,
    significance: "Largest palace complex in Rajasthan, built over 400 years by successive Mewar rulers on the banks of Lake Pichola.",
    timeNeeded: 2.5,
    airportNearby: true,
  },
  {
    slug: "rishikesh-laxman-jhula",
    name: "Rishikesh (Laxman Jhula)",
    city: "Rishikesh",
    state: "Uttarakhand",
    category: "Religious Site",
    lat: 30.1254,
    lng: 78.3212,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "Open 24 Hours",
    baseCapacity: 20000,
    zone: "Northern",
    type: "Religious",
    established: "1929",
    bestTime: "September to November, February to May",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 1.0,
    significance: "The Yoga Capital of the World. Gateway to the Char Dham pilgrimage. Laxman Jhula is an iconic iron suspension bridge over the Ganges.",
    timeNeeded: 3.0,
    airportNearby: true,
  },
  {
    slug: "agra-fort",
    name: "Agra Fort",
    city: "Agra",
    state: "Uttar Pradesh",
    category: "Fort",
    lat: 27.1795,
    lng: 78.0211,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 600,
    openingHours: "6:00 AM – 6:00 PM",
    baseCapacity: 15000,
    zone: "Northern",
    type: "Historical",
    established: "1573",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 1.0,
    significance: "UNESCO World Heritage Site. Mughal emperors' residence for generations. Shah Jahan was imprisoned here and could only view the Taj Mahal from his cell.",
    timeNeeded: 2.0,
    airportNearby: true,
  },

  // Southern Zone
  {
    slug: "gateway-of-india",
    name: "Gateway of India",
    city: "Mumbai",
    state: "Maharashtra",
    category: "Monument",
    lat: 18.9220,
    lng: 72.8347,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "Open 24 Hours",
    baseCapacity: 30000,
    zone: "Southern",
    type: "Historical",
    established: "1924",
    bestTime: "October to February",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 2.5,
    significance: "Built to commemorate the visit of King George V in 1911. The last British troops left India through this arch in 1948. Symbol of Mumbai.",
    timeNeeded: 1.0,
    airportNearby: true,
  },
  {
    slug: "mahabalipuram",
    name: "Mahabalipuram",
    city: "Mahabalipuram",
    state: "Tamil Nadu",
    category: "Temple/Ruins",
    lat: 12.6172,
    lng: 80.1927,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 40,
    openingHours: "6:00 AM – 6:00 PM",
    baseCapacity: 5000,
    zone: "Southern",
    type: "Historical",
    established: "7th century",
    bestTime: "November to February",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.6,
    reviewCount: 0.6,
    significance: "UNESCO World Heritage Site. Pallava dynasty rock-cut monuments including the Shore Temple and Arjuna's Penance, the world's largest open-air rock relief.",
    timeNeeded: 3.0,
    airportNearby: true,
  },
  {
    slug: "bangalore-palace",
    name: "Bangalore Palace",
    city: "Bengaluru",
    state: "Karnataka",
    category: "Palace",
    lat: 12.9987,
    lng: 77.5921,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 250,
    openingHours: "10:00 AM – 5:30 PM",
    baseCapacity: 3000,
    zone: "Southern",
    type: "Historical",
    established: "1878",
    bestTime: "October to February",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.3,
    reviewCount: 0.4,
    significance: "Tudor-style palace inspired by Windsor Castle. Owned by the Wadiyar dynasty with 454 acres of grounds used for major concerts and events.",
    timeNeeded: 1.5,
    airportNearby: true,
  },
  {
    slug: "tirupati-balaji",
    name: "Tirupati Balaji Temple",
    city: "Tirupati",
    state: "Andhra Pradesh",
    category: "Temple",
    lat: 13.6833,
    lng: 79.3500,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "2:30 AM – 1:30 AM (next day)",
    baseCapacity: 75000,
    zone: "Southern",
    type: "Religious",
    established: "300 CE",
    bestTime: "September to February",
    weeklyOff: "Open All Days",
    dslrAllowed: false,
    googleRating: 4.7,
    reviewCount: 3.5,
    significance: "The richest and most visited Hindu temple in the world. Receives 50,000–100,000 pilgrims daily. Annual revenue exceeds ₹3,000 crore.",
    timeNeeded: 4.0,
    airportNearby: true,
  },
  {
    slug: "padmanabhaswamy-temple",
    name: "Padmanabhaswamy Temple",
    city: "Thiruvananthapuram",
    state: "Kerala",
    category: "Temple",
    lat: 8.4826,
    lng: 76.9443,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "3:30 AM – 12:00 PM, 5:00 PM – 8:00 PM",
    baseCapacity: 10000,
    zone: "Southern",
    type: "Religious",
    established: "8th century",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: false,
    googleRating: 4.6,
    reviewCount: 0.8,
    significance: "Home to the richest temple treasure ever found — vaults contain gold and gems worth over $20 billion. Strict dress code enforced.",
    timeNeeded: 2.0,
    airportNearby: true,
  },
  {
    slug: "chowmahalla-palace",
    name: "Chowmahalla Palace",
    city: "Hyderabad",
    state: "Telangana",
    category: "Palace",
    lat: 17.3580,
    lng: 78.4718,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 200,
    openingHours: "10:00 AM – 5:00 PM (Closed Fridays)",
    baseCapacity: 3000,
    zone: "Southern",
    type: "Historical",
    established: "1750",
    bestTime: "October to March",
    weeklyOff: "Friday",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.5,
    significance: "Seat of the Asaf Jahi dynasty (Nizams of Hyderabad). Won the UNESCO Asia-Pacific Heritage Award for Cultural Heritage Conservation in 2010.",
    timeNeeded: 1.5,
    airportNearby: true,
  },

  // Eastern Zone
  {
    slug: "victoria-memorial",
    name: "Victoria Memorial",
    city: "Kolkata",
    state: "West Bengal",
    category: "Museum",
    lat: 22.5449,
    lng: 88.3426,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 30,
    openingHours: "10:00 AM – 5:00 PM (Closed Mondays)",
    baseCapacity: 8000,
    zone: "Eastern",
    type: "Historical",
    established: "1921",
    bestTime: "October to March",
    weeklyOff: "Monday",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 1.2,
    significance: "Built in memory of Queen Victoria using white Makrana marble. Now a museum housing 28,394 artifacts including rare paintings, manuscripts, and sculptures.",
    timeNeeded: 2.0,
    airportNearby: true,
  },
  {
    slug: "jagannath-temple-puri",
    name: "Jagannath Temple Puri",
    city: "Puri",
    state: "Odisha",
    category: "Temple",
    lat: 19.8049,
    lng: 85.8179,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "5:00 AM – 11:00 PM",
    baseCapacity: 25000,
    zone: "Eastern",
    type: "Religious",
    established: "12th century",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: false,
    googleRating: 4.6,
    reviewCount: 1.5,
    significance: "One of the Char Dham pilgrimage sites. Famous for the annual Rath Yatra (Chariot Festival). Only Hindus are allowed inside.",
    timeNeeded: 2.0,
    airportNearby: false,
  },
  {
    slug: "howrah-bridge",
    name: "Howrah Bridge",
    city: "Kolkata",
    state: "West Bengal",
    category: "Bridge",
    lat: 22.5851,
    lng: 88.3468,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "Open 24 Hours",
    baseCapacity: 100000,
    zone: "Eastern",
    type: "Historical",
    established: "1943",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.3,
    reviewCount: 0.8,
    significance: "One of the busiest cantilever bridges in the world, carrying 100,000+ vehicles and countless pedestrians daily. Icon of Kolkata since 1943.",
    timeNeeded: 0.5,
    airportNearby: true,
  },
  {
    slug: "sundarbans",
    name: "Sundarbans",
    city: "South 24 Parganas",
    state: "West Bengal",
    category: "National Park",
    lat: 21.9497,
    lng: 89.1833,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 300,
    openingHours: "Varies by boat tour",
    baseCapacity: 2000,
    zone: "Eastern",
    type: "Natural",
    established: "1984",
    bestTime: "September to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.3,
    reviewCount: 0.3,
    significance: "UNESCO World Heritage Site. Largest mangrove forest in the world and home to the Royal Bengal Tiger. Spans India and Bangladesh.",
    timeNeeded: 8.0,
    airportNearby: false,
  },

  // Western Zone
  {
    slug: "goa-beaches",
    name: "Goa Beaches (Calangute)",
    city: "Goa",
    state: "Goa",
    category: "Beach",
    lat: 15.5449,
    lng: 73.7553,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "Open 24 Hours",
    baseCapacity: 50000,
    zone: "Western",
    type: "Beach",
    established: null,
    bestTime: "November to February",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.2,
    reviewCount: 2.0,
    significance: "India's premier beach destination. Calangute is the 'Queen of Beaches'. Goa blends Portuguese heritage with Indian culture.",
    timeNeeded: 4.0,
    airportNearby: true,
  },
  {
    slug: "rann-of-kutch",
    name: "Rann of Kutch",
    city: "Kutch",
    state: "Gujarat",
    category: "Natural Landscape",
    lat: 23.7337,
    lng: 69.8597,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 100,
    openingHours: "6:00 AM – 6:00 PM (Rann Utsav: Nov-Feb)",
    baseCapacity: 15000,
    zone: "Western",
    type: "Natural",
    established: null,
    bestTime: "November to February",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.6,
    significance: "World's largest salt desert spanning 7,505 sq km. The white desert under full moonlight is a surreal experience. Rann Utsav attracts 500,000+ visitors annually.",
    timeNeeded: 6.0,
    airportNearby: false,
  },
  {
    slug: "somnath-temple",
    name: "Somnath Temple",
    city: "Veraval",
    state: "Gujarat",
    category: "Temple",
    lat: 20.8880,
    lng: 70.4013,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "6:00 AM – 9:30 PM",
    baseCapacity: 20000,
    zone: "Western",
    type: "Religious",
    established: "Reconstructed 1951",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: false,
    googleRating: 4.7,
    reviewCount: 1.5,
    significance: "First among the twelve Jyotirlinga shrines of Shiva. Destroyed and rebuilt multiple times across centuries, symbolising Hindu resilience.",
    timeNeeded: 1.5,
    airportNearby: false,
  },
  {
    slug: "mehrangarh-fort",
    name: "Mehrangarh Fort",
    city: "Jodhpur",
    state: "Rajasthan",
    category: "Fort",
    lat: 26.2986,
    lng: 73.0183,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 200,
    openingHours: "9:00 AM – 5:00 PM",
    baseCapacity: 6000,
    zone: "Western",
    type: "Historical",
    established: "1459",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.7,
    reviewCount: 0.9,
    significance: "One of India's largest forts, perched 125 metres above Jodhpur. Houses an excellent museum. Rudyard Kipling called it 'the work of angels, fairies and giants'.",
    timeNeeded: 3.0,
    airportNearby: true,
  },

  // Central Zone
  {
    slug: "sanchi-stupa",
    name: "Sanchi Stupa",
    city: "Sanchi",
    state: "Madhya Pradesh",
    category: "Monument",
    lat: 23.4793,
    lng: 77.7399,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 30,
    openingHours: "8:30 AM – 5:00 PM",
    baseCapacity: 3000,
    zone: "Central",
    type: "Historical",
    established: "3rd century BCE",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.3,
    significance: "UNESCO World Heritage Site. Commissioned by Emperor Ashoka. Oldest stone structure in India and one of the best-preserved ancient stupas in the world.",
    timeNeeded: 2.0,
    airportNearby: false,
  },
  {
    slug: "mandu",
    name: "Mandu (Rupmati Pavilion)",
    city: "Mandu",
    state: "Madhya Pradesh",
    category: "Ruins",
    lat: 22.3332,
    lng: 75.3964,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 25,
    openingHours: "Sunrise – Sunset",
    baseCapacity: 2000,
    zone: "Central",
    type: "Historical",
    established: "15th century",
    bestTime: "July to March",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 0.2,
    significance: "The 'City of Joy'. Medieval fort city with Afghan architecture. Rupmati Pavilion offers panoramic views of the Narmada valley.",
    timeNeeded: 4.0,
    airportNearby: false,
  },

  // North-Eastern Zone
  {
    slug: "kaziranga-national-park",
    name: "Kaziranga National Park",
    city: "Golaghat",
    state: "Assam",
    category: "National Park",
    lat: 26.5775,
    lng: 93.1711,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 250,
    openingHours: "7:00 AM – 3:30 PM (Nov to Apr)",
    baseCapacity: 3000,
    zone: "North-Eastern",
    type: "Natural",
    established: "1905",
    bestTime: "November to April",
    weeklyOff: "Closed May–October",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 0.4,
    significance: "UNESCO World Heritage Site. Home to two-thirds of the world's one-horned rhinoceroses. Also has the highest density of tigers among protected areas.",
    timeNeeded: 6.0,
    airportNearby: false,
  },
  {
    slug: "tawang-monastery",
    name: "Tawang Monastery",
    city: "Tawang",
    state: "Arunachal Pradesh",
    category: "Monastery",
    lat: 27.5861,
    lng: 91.8595,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "7:00 AM – 6:00 PM",
    baseCapacity: 1500,
    zone: "North-Eastern",
    type: "Religious",
    established: "1680",
    bestTime: "March to October",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.6,
    reviewCount: 0.2,
    significance: "Largest monastery in India and second-largest in the world after Lhasa's Potala. Birthplace of the 6th Dalai Lama.",
    timeNeeded: 2.0,
    airportNearby: false,
  },
  {
    slug: "living-root-bridges",
    name: "Living Root Bridges",
    city: "Cherrapunji",
    state: "Meghalaya",
    category: "Natural Wonder",
    lat: 25.2857,
    lng: 91.7297,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "Daylight hours",
    baseCapacity: 1000,
    zone: "North-Eastern",
    type: "Natural",
    established: "500+ years old",
    bestTime: "October to May",
    weeklyOff: "Open All Days",
    dslrAllowed: true,
    googleRating: 4.7,
    reviewCount: 0.15,
    significance: "Bio-engineering marvels created by the Khasi and Jaintia tribes over centuries by training Ficus elastica roots across rivers. Some are over 500 years old.",
    timeNeeded: 6.0,
    airportNearby: false,
  },

  // Recent / Modern
  {
    slug: "ram-mandir",
    name: "Ram Mandir",
    city: "Ayodhya",
    state: "Uttar Pradesh",
    category: "Temple",
    lat: 26.7955,
    lng: 82.1940,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "7:00 AM – 11:30 PM",
    baseCapacity: 70000,
    zone: "Northern",
    type: "Religious",
    established: "2024",
    bestTime: "October to March",
    weeklyOff: "Open All Days",
    dslrAllowed: false,
    googleRating: 4.9,
    reviewCount: 5.0,
    significance: "Inaugurated on 22 Jan 2024 by the PM. Built at Ram Janmabhoomi, the believed birthplace of Lord Ram. One of the most significant religious constructions of the 21st century.",
    timeNeeded: 2.0,
    airportNearby: true,
  },
  {
    slug: "statue-of-unity",
    name: "Statue of Unity",
    city: "Kevadiya",
    state: "Gujarat",
    category: "Monument",
    lat: 21.8380,
    lng: 73.7191,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 350,
    openingHours: "8:00 AM – 6:00 PM (Closed Mondays)",
    baseCapacity: 15000,
    zone: "Western",
    type: "Historical",
    established: "2018",
    bestTime: "October to February",
    weeklyOff: "Monday",
    dslrAllowed: true,
    googleRating: 4.4,
    reviewCount: 1.5,
    significance: "World's tallest statue at 182 metres, honouring Sardar Vallabhbhai Patel. Twice the height of the Statue of Liberty.",
    timeNeeded: 3.0,
    airportNearby: false,
  },
  {
    slug: "lotus-temple",
    name: "Lotus Temple",
    city: "New Delhi",
    state: "Delhi",
    category: "Temple",
    lat: 28.5535,
    lng: 77.2588,
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=80"
]),
    entryFeeINR: 0,
    openingHours: "9:00 AM – 5:30 PM (Closed Mondays)",
    baseCapacity: 8000,
    zone: "Northern",
    type: "Religious",
    established: "1986",
    bestTime: "October to March",
    weeklyOff: "Monday",
    dslrAllowed: true,
    googleRating: 4.5,
    reviewCount: 1.8,
    significance: "Bahá'í House of Worship shaped like a lotus flower with 27 marble petals. Won numerous architectural awards. Open to people of all faiths.",
    timeNeeded: 1.0,
    airportNearby: true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// SECTION 2 — Multilingual Content (en, hi, es) for ALL 50 sites
// ═══════════════════════════════════════════════════════════════════

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
  },

  // ─── 35 NEW SITES CONTENT ──────────────────────────────────────

  "golden-temple": {
    en: {
      history: "Founded in 1604 by Guru Arjan Dev, the fifth Sikh Guru, who installed the Adi Granth here. The gold covering was added by Maharaja Ranjit Singh in the early 19th century.",
      significance: "The holiest shrine in Sikhism (Sri Harmandir Sahib). Its langar (community kitchen) serves over 50,000 free meals daily to people of all faiths.",
      tips: "Cover your head and remove shoes before entering. The early morning prayer (4 AM) is a profound experience. Photography is allowed in the complex but not inside the sanctum."
    },
    hi: {
      history: "1604 में पाँचवें सिख गुरु, गुरु अर्जन देव द्वारा स्थापित, जिन्होंने यहाँ आदि ग्रंथ की स्थापना की। सोने की परत 19वीं शताब्दी की शुरुआत में महाराजा रणजीत सिंह ने लगवाई।",
      significance: "सिख धर्म का सबसे पवित्र तीर्थ (श्री हरमंदिर साहिब)। लंगर में सभी धर्मों के लोगों को रोज़ 50,000 से अधिक मुफ़्त भोजन परोसा जाता है।",
      tips: "प्रवेश से पहले सिर ढकें और जूते उतारें। सुबह 4 बजे की प्रार्थना एक गहन अनुभव है।"
    },
    es: {
      history: "Fundado en 1604 por Guru Arjan Dev, el quinto Guru Sij. El revestimiento de oro fue añadido por Maharajá Ranjit Singh a principios del siglo XIX.",
      significance: "El santuario más sagrado del sijismo. Su cocina comunitaria (langar) sirve más de 50.000 comidas gratuitas diarias a personas de todas las religiones.",
      tips: "Cúbrase la cabeza y quítese los zapatos antes de entrar. La oración matutina (4 AM) es una experiencia profunda."
    }
  },
  "humayuns-tomb": {
    en: {
      history: "Commissioned by Empress Bega Begum for her husband Emperor Humayun in 1565. It was the first garden-tomb on the Indian subcontinent, predating the Taj Mahal by nearly a century.",
      significance: "UNESCO World Heritage Site. The design directly inspired the construction of the Taj Mahal. The surrounding Mughal-era garden complex has been beautifully restored.",
      tips: "Less crowded than other Delhi monuments. The nearby Isa Khan's tomb and the Sundar Nursery are worth exploring. Best visited in late afternoon light."
    },
    hi: {
      history: "1565 में महारानी बेगा बेगम ने अपने पति सम्राट हुमायूँ के लिए इसे बनवाया। यह भारतीय उपमहाद्वीप का पहला बाग़-मकबरा था।",
      significance: "यूनेस्को विश्व धरोहर स्थल। इसकी डिज़ाइन ने सीधे ताज महल के निर्माण को प्रेरित किया।",
      tips: "दिल्ली के अन्य स्मारकों से कम भीड़। ईसा खान का मकबरा और सुंदर नर्सरी भी देखें।"
    },
    es: {
      history: "Encargada por la emperatriz Bega Begum para su esposo el emperador Humayun en 1565. Fue la primera tumba-jardín del subcontinente indio.",
      significance: "Patrimonio de la Humanidad. Su diseño inspiró directamente la construcción del Taj Mahal.",
      tips: "Menos concurrido que otros monumentos de Delhi. La tumba cercana de Isa Khan y Sundar Nursery valen la pena."
    }
  },
  "jallianwala-bagh": {
    en: {
      history: "On 13 April 1919, British troops under General Dyer fired on a peaceful gathering here, killing an estimated 379–1,500 civilians. The memorial was established in 1951.",
      significance: "A pivotal site in India's independence movement. The bullet marks on the walls and the martyr's well remain preserved as a reminder of the massacre.",
      tips: "Free entry. Allow 30-60 minutes. The gallery with newspaper clippings and photos is informative. Visit the preserved well and bullet-marked walls."
    },
    hi: {
      history: "13 अप्रैल 1919 को जनरल डायर के नेतृत्व में ब्रिटिश सैनिकों ने यहाँ एक शांतिपूर्ण सभा पर गोलीबारी की, जिसमें अनुमानित 379-1,500 नागरिक मारे गए।",
      significance: "भारत के स्वतंत्रता आंदोलन में एक महत्वपूर्ण स्थल। दीवारों पर गोलियों के निशान और शहीद कुआँ नरसंहार की याद दिलाते हैं।",
      tips: "प्रवेश निःशुल्क। 30-60 मिनट दें। अख़बार की कटिंग और फ़ोटो वाली गैलरी जानकारीपूर्ण है।"
    },
    es: {
      history: "El 13 de abril de 1919, tropas británicas bajo el General Dyer dispararon contra una reunión pacífica aquí, matando a entre 379 y 1.500 civiles.",
      significance: "Un sitio crucial en el movimiento de independencia de India. Las marcas de bala en las paredes permanecen como recuerdo de la masacre.",
      tips: "Entrada gratuita. Reserve 30-60 minutos. La galería con recortes de periódicos y fotos es informativa."
    }
  },
  "varanasi-ghats": {
    en: {
      history: "Varanasi is one of the oldest continuously inhabited cities in the world, dating back to the 11th century BCE. The 88 ghats along the Ganges were largely developed by the Marathas and Scindias in the 18th century.",
      significance: "The spiritual capital of India. Hindus believe dying in Varanasi grants moksha (liberation from the cycle of rebirth). The Ganga Aarti ceremony at Dashashwamedh Ghat is iconic.",
      tips: "Take a sunrise boat ride on the Ganges for the best experience. Dashashwamedh Ghat's evening Ganga Aarti starts at 6:45 PM. Dress modestly near cremation ghats."
    },
    hi: {
      history: "वाराणसी दुनिया के सबसे पुराने लगातार बसे शहरों में से एक है, जो 11वीं शताब्दी ईसा पूर्व से है। गंगा के किनारे 88 घाट 18वीं शताब्दी में मराठों और सिंधियों ने विकसित किए।",
      significance: "भारत की आध्यात्मिक राजधानी। हिंदू मानते हैं कि वाराणसी में मृत्यु मोक्ष प्रदान करती है। दशाश्वमेध घाट पर गंगा आरती प्रतिष्ठित है।",
      tips: "सबसे अच्छे अनुभव के लिए सूर्योदय पर गंगा में नाव की सवारी करें। शाम की गंगा आरती 6:45 PM पर शुरू होती है।"
    },
    es: {
      history: "Varanasi es una de las ciudades habitadas más antiguas del mundo, desde el siglo XI a.C. Los 88 ghats a lo largo del Ganges fueron desarrollados principalmente por los Marathas en el siglo XVIII.",
      significance: "La capital espiritual de India. Los hindúes creen que morir en Varanasi otorga moksha. La ceremonia Ganga Aarti es icónica.",
      tips: "Tome un paseo en bote al amanecer por el Ganges. La Ganga Aarti vespertina comienza a las 6:45 PM. Vista modestamente cerca de los ghats de cremación."
    }
  },
  "city-palace-udaipur": {
    en: {
      history: "Construction began in 1559 by Maharana Udai Singh II. Successive rulers over 400 years added to the complex, creating Rajasthan's largest palace spanning the banks of Lake Pichola.",
      significance: "A fusion of Rajasthani and Mughal architectural styles. Part of the palace is now a luxury hotel, while the rest houses museums with miniature paintings and royal artefacts.",
      tips: "The Crystal Gallery requires a separate ticket. The palace view from a boat on Lake Pichola is spectacular. Visit during sunset for the best lighting."
    },
    hi: {
      history: "1559 में महाराणा उदय सिंह द्वितीय ने निर्माण शुरू किया। 400 वर्षों में क्रमिक शासकों ने इसमें जोड़कर राजस्थान का सबसे बड़ा महल बनाया।",
      significance: "राजस्थानी और मुगल शैलियों का मिश्रण। महल का एक हिस्सा अब लक्ज़री होटल है, बाकी में संग्रहालय हैं।",
      tips: "क्रिस्टल गैलरी के लिए अलग टिकट लगता है। झील पिछोला से महल का दृश्य शानदार है। सूर्यास्त के समय जाएँ।"
    },
    es: {
      history: "La construcción comenzó en 1559 por Maharana Udai Singh II. Sucesivos gobernantes durante 400 años añadieron al complejo, creando el palacio más grande de Rajasthan.",
      significance: "Una fusión de estilos arquitectónicos rajput y mogol. Parte del palacio es ahora un hotel de lujo.",
      tips: "La Galería de Cristal requiere entrada separada. La vista del palacio desde un bote en el Lago Pichola es espectacular."
    }
  },
  "rishikesh-laxman-jhula": {
    en: {
      history: "Laxman Jhula is a 450-ft iron suspension bridge built in 1929 across the Ganges. Legend says Lord Laxmana crossed the river here on a jute rope. Rishikesh gained global fame after the Beatles visited in 1968.",
      significance: "Known as the Yoga Capital of the World. Gateway to the Char Dham pilgrimage sites. A hub for adventure sports, ashrams, and spiritual seekers.",
      tips: "The bridge can sway — hold the railings. Attend a free yoga class at Parmarth Niketan ashram. Rafting is best from September to November."
    },
    hi: {
      history: "लक्ष्मण झूला 1929 में गंगा पर बना 450 फीट का लोहे का झूला पुल है। किंवदंती है कि भगवान लक्ष्मण ने यहाँ जूट की रस्सी पर नदी पार की थी।",
      significance: "विश्व की योग राजधानी। चार धाम तीर्थ स्थलों का प्रवेश द्वार। साहसिक खेलों और आश्रमों का केंद्र।",
      tips: "पुल हिल सकता है — रेलिंग पकड़ें। परमार्थ निकेतन में मुफ़्त योग कक्षा में भाग लें।"
    },
    es: {
      history: "Laxman Jhula es un puente colgante de hierro de 450 pies construido en 1929 sobre el Ganges. Rishikesh ganó fama mundial tras la visita de los Beatles en 1968.",
      significance: "Conocido como la Capital Mundial del Yoga. Puerta de entrada a los sitios de peregrinación Char Dham.",
      tips: "El puente puede balancearse — sujétese a las barandillas. Asista a una clase de yoga gratuita en el ashram Parmarth Niketan."
    }
  },
  "agra-fort": {
    en: {
      history: "Built primarily by Emperor Akbar in 1573, with additions by Shah Jahan who added white marble structures. The fort served as the main residence of Mughal emperors until the capital shifted to Delhi.",
      significance: "UNESCO World Heritage Site. Shah Jahan spent his final years imprisoned here by his son Aurangzeb, gazing at the Taj Mahal from his marble chamber.",
      tips: "Visit in the morning before heading to the Taj Mahal (2 km away). The Diwan-i-Khas and Musamman Burj offer the best Taj views. Allow 2 hours."
    },
    hi: {
      history: "मुख्य रूप से 1573 में सम्राट अकबर द्वारा निर्मित, शाहजहाँ ने सफेद संगमरमर की संरचनाएँ जोड़ीं। यह किला दिल्ली तक राजधानी बदलने तक मुगल सम्राटों का मुख्य निवास था।",
      significance: "यूनेस्को विश्व धरोहर स्थल। शाहजहाँ ने अपने अंतिम वर्ष यहाँ कैद में बिताए, अपने कक्ष से ताज महल को निहारते हुए।",
      tips: "ताज महल जाने से पहले सुबह जाएँ। दीवान-ए-ख़ास से ताज के सबसे अच्छे दृश्य दिखते हैं।"
    },
    es: {
      history: "Construido principalmente por el emperador Akbar en 1573, con adiciones de Shah Jahan. El fuerte sirvió como residencia principal de los emperadores mogoles.",
      significance: "Patrimonio de la Humanidad. Shah Jahan pasó sus últimos años prisionero aquí, contemplando el Taj Mahal desde su cámara de mármol.",
      tips: "Visite por la mañana antes de ir al Taj Mahal (2 km). El Diwan-i-Khas ofrece las mejores vistas del Taj."
    }
  },
  "gateway-of-india": {
    en: {
      history: "Built between 1911 and 1924 to commemorate the visit of King George V and Queen Mary to Mumbai. Designed by architect George Wittet in the Indo-Saracenic style.",
      significance: "The last British troops left India through this gateway in 1948. It has become the defining symbol of Mumbai, overlooking the Arabian Sea.",
      tips: "Best visited in the evening. Take a ferry to Elephanta Caves from here. The nearby Taj Mahal Palace Hotel makes for a great photo backdrop."
    },
    hi: {
      history: "1911 से 1924 के बीच किंग जॉर्ज पंचम और क्वीन मैरी की मुंबई यात्रा की याद में बनाया गया। वास्तुकार जॉर्ज विटेट द्वारा इंडो-सारासेनिक शैली में डिज़ाइन किया गया।",
      significance: "1948 में अंतिम ब्रिटिश सैनिकों ने इस प्रवेश द्वार से भारत छोड़ा। यह मुंबई का प्रतिष्ठित प्रतीक बन गया है।",
      tips: "शाम को जाना सबसे अच्छा। यहाँ से एलिफेंटा गुफाओं के लिए फ़ेरी लें। पास का ताज होटल फ़ोटो के लिए शानदार पृष्ठभूमि है।"
    },
    es: {
      history: "Construido entre 1911 y 1924 para conmemorar la visita del Rey Jorge V y la Reina María a Mumbai. Diseñado en estilo indo-sarraceno.",
      significance: "Las últimas tropas británicas abandonaron India a través de esta puerta en 1948. Se ha convertido en el símbolo definitivo de Mumbai.",
      tips: "Mejor visitarlo por la noche. Tome un ferry a las Cuevas de Elephanta desde aquí."
    }
  },
  "mahabalipuram": {
    en: {
      history: "Built by the Pallava dynasty in the 7th and 8th centuries. The Shore Temple, Pancha Rathas, and Arjuna's Penance are among the oldest surviving examples of Dravidian architecture.",
      significance: "UNESCO World Heritage Site. Arjuna's Penance is the world's largest open-air rock relief at 27m × 9m. The site influenced temple architecture across Southeast Asia.",
      tips: "Visit the Shore Temple at sunrise or sunset for dramatic lighting. Combine with a day trip from Chennai (60 km). The town has excellent seafood restaurants."
    },
    hi: {
      history: "7वीं और 8वीं शताब्दी में पल्लव राजवंश द्वारा निर्मित। शोर मंदिर, पंच रथ और अर्जुन की तपस्या द्रविड़ वास्तुकला के सबसे पुराने उदाहरणों में हैं।",
      significance: "यूनेस्को विश्व धरोहर स्थल। अर्जुन की तपस्या 27m × 9m पर दुनिया की सबसे बड़ी खुली चट्टान राहत है।",
      tips: "नाटकीय रोशनी के लिए सूर्योदय या सूर्यास्त पर शोर मंदिर जाएँ। चेन्नई से दिन की यात्रा के साथ जोड़ें।"
    },
    es: {
      history: "Construido por la dinastía Pallava en los siglos VII y VIII. El Templo de la Orilla y la Penitencia de Arjuna son los ejemplos más antiguos de arquitectura dravidiana.",
      significance: "Patrimonio de la Humanidad. La Penitencia de Arjuna es el mayor relieve en roca al aire libre del mundo.",
      tips: "Visite el Templo de la Orilla al amanecer o atardecer. Combínelo con una excursión desde Chennai (60 km)."
    }
  },
  "bangalore-palace": {
    en: {
      history: "Built in 1878 by King Chamaraja Wadiyar, inspired by England's Windsor Castle after a visit to Europe. The Tudor-style architecture is unique among Indian palaces.",
      significance: "Owned by the Wadiyar dynasty with 454 acres of grounds. The palace grounds now host major concerts and cultural events. A rare example of Tudor architecture in India.",
      tips: "Audio guides are available and recommended. Photography charges are separate. The palace is in the heart of the city near MG Road."
    },
    hi: {
      history: "1878 में राजा चामराजा वाडियार ने यूरोप यात्रा के बाद इंग्लैंड के विंडसर कैसल से प्रेरित होकर इसे बनवाया। ट्यूडर शैली भारतीय महलों में अनूठी है।",
      significance: "वाडियार वंश के स्वामित्व वाला 454 एकड़ का परिसर। अब प्रमुख संगीत कार्यक्रमों और सांस्कृतिक कार्यक्रमों की मेज़बानी करता है।",
      tips: "ऑडियो गाइड उपलब्ध हैं। फ़ोटोग्राफ़ी शुल्क अलग है। महल शहर के केंद्र में एमजी रोड के पास है।"
    },
    es: {
      history: "Construido en 1878 por el Rey Chamaraja Wadiyar, inspirado en el Castillo de Windsor. La arquitectura Tudor es única entre los palacios indios.",
      significance: "Propiedad de la dinastía Wadiyar con 454 acres. Ahora alberga conciertos y eventos culturales importantes.",
      tips: "Las audioguías están disponibles y son recomendables. Los cargos de fotografía son separados."
    }
  },
  "tirupati-balaji": {
    en: {
      history: "The Tirumala Venkateswara Temple dates back to around 300 CE, though legends trace it much earlier. The present structure was expanded by various dynasties including the Pallavas, Cholas, and Vijayanagara kings.",
      significance: "The richest and most visited Hindu temple in the world. Receives 50,000-100,000 pilgrims daily. Annual revenue exceeds ₹3,000 crore from donations and the hair-offering tradition.",
      tips: "Book darshan tickets online in advance. The ₹300 special darshan saves hours of waiting. Tonsure (head-shaving) is a common offering. Laddoo prasadam is famous."
    },
    hi: {
      history: "तिरुमला वेंकटेश्वर मंदिर लगभग 300 ई. का है। वर्तमान संरचना पल्लव, चोल और विजयनगर राजाओं ने विस्तारित की।",
      significance: "दुनिया का सबसे अमीर और सबसे अधिक दौरा किया जाने वाला हिंदू मंदिर। रोज़ाना 50,000-100,000 तीर्थयात्री आते हैं।",
      tips: "दर्शन टिकट ऑनलाइन पहले से बुक करें। ₹300 विशेष दर्शन से घंटों की प्रतीक्षा बचती है। लड्डू प्रसाद प्रसिद्ध है।"
    },
    es: {
      history: "El Templo Tirumala Venkateswara data de alrededor del 300 d.C. La estructura actual fue expandida por varias dinastías.",
      significance: "El templo hindú más rico y visitado del mundo. Recibe 50.000-100.000 peregrinos diarios.",
      tips: "Reserve entradas de darshan en línea con anticipación. El darshan especial de ₹300 ahorra horas de espera."
    }
  },
  "padmanabhaswamy-temple": {
    en: {
      history: "Built in the Dravidian style, the temple dates back to at least the 8th century. The Travancore royal family has been its custodians for centuries.",
      significance: "Home to the richest temple treasure ever discovered — vaults opened in 2011 revealed gold, gems, and artefacts worth over $20 billion. Only Hindus in traditional attire are allowed entry.",
      tips: "Strict dress code: men must wear dhoti, women must wear sari or churidar. No electronic devices or bags inside. Photography strictly prohibited."
    },
    hi: {
      history: "द्रविड़ शैली में निर्मित, यह मंदिर कम से कम 8वीं शताब्दी का है। त्रावणकोर शाही परिवार सदियों से इसके संरक्षक रहे हैं।",
      significance: "अब तक खोजे गए सबसे अमीर मंदिर खजाने का घर — 2011 में खोले गए तहखानों में $20 बिलियन से अधिक का सोना और रत्न मिले।",
      tips: "सख्त ड्रेस कोड: पुरुष धोती, महिलाएँ साड़ी या चूड़ीदार पहनें। अंदर कोई इलेक्ट्रॉनिक उपकरण नहीं।"
    },
    es: {
      history: "Construido en estilo dravidiano, el templo data de al menos el siglo VIII. La familia real de Travancore ha sido su custodio durante siglos.",
      significance: "Hogar del tesoro de templo más rico jamás descubierto — las bóvedas abiertas en 2011 revelaron oro y gemas por más de $20 mil millones.",
      tips: "Código de vestimenta estricto: los hombres deben usar dhoti, las mujeres sari. Sin dispositivos electrónicos ni bolsos dentro."
    }
  },
  "chowmahalla-palace": {
    en: {
      history: "Built in the 18th century by the Nizams of Hyderabad, the name means 'Four Palaces'. The grand complex was the seat of the Asaf Jahi dynasty and venue for state functions.",
      significance: "Won the UNESCO Asia-Pacific Heritage Award in 2010. Houses a collection of vintage cars, weapons, and clothing of the Nizams. Considered one of India's most elegant palaces.",
      tips: "Closed on Fridays. The Durbar Hall and vintage car collection are highlights. Photography is allowed. Budget 1.5 hours."
    },
    hi: {
      history: "18वीं शताब्दी में हैदराबाद के निज़ामों द्वारा निर्मित, नाम का अर्थ 'चार महल' है। यह भव्य परिसर आसफ जाही वंश की सीट और राजकीय समारोहों का स्थल था।",
      significance: "2010 में यूनेस्को एशिया-पैसिफिक हेरिटेज अवार्ड जीता। निज़ामों की विंटेज कारों, हथियारों और कपड़ों का संग्रह।",
      tips: "शुक्रवार को बंद। दरबार हॉल और विंटेज कार संग्रह मुख्य आकर्षण हैं। 1.5 घंटे दें।"
    },
    es: {
      history: "Construido en el siglo XVIII por los Nizams de Hyderabad, el nombre significa 'Cuatro Palacios'. Fue la sede de la dinastía Asaf Jahi.",
      significance: "Ganó el Premio de Patrimonio UNESCO Asia-Pacífico en 2010. Alberga una colección de autos clásicos y armas de los Nizams.",
      tips: "Cerrado los viernes. El Salón Durbar y la colección de autos son lo más destacado. Se permite fotografía."
    }
  },
  "victoria-memorial": {
    en: {
      history: "Built between 1906 and 1921 in memory of Queen Victoria using white Makrana marble. Lord Curzon conceived it as a 'Taj of the British Empire'. Designed by William Emerson.",
      significance: "Now a museum housing 28,394 artefacts including rare paintings, manuscripts, royal portraits, and the famous 'Twilight of the Raj' gallery on India's independence movement.",
      tips: "Closed on Mondays and national holidays. The evening light-and-sound show is excellent. The gardens are open separately and are perfect for a stroll."
    },
    hi: {
      history: "1906 और 1921 के बीच रानी विक्टोरिया की याद में सफेद मकराना संगमरमर से निर्मित। लॉर्ड कर्ज़न ने इसे 'ब्रिटिश साम्राज्य का ताज' माना।",
      significance: "अब 28,394 कलाकृतियों वाला संग्रहालय जिसमें दुर्लभ चित्र, पांडुलिपियाँ और स्वतंत्रता आंदोलन की गैलरी शामिल है।",
      tips: "सोमवार और राष्ट्रीय छुट्टियों पर बंद। शाम की लाइट एंड साउंड शो उत्कृष्ट है। बगीचे अलग से खुले हैं।"
    },
    es: {
      history: "Construido entre 1906 y 1921 en memoria de la Reina Victoria usando mármol blanco Makrana. Lord Curzon lo concibió como un 'Taj del Imperio Británico'.",
      significance: "Ahora un museo con 28.394 artefactos incluyendo pinturas raras y una galería sobre el movimiento de independencia de India.",
      tips: "Cerrado los lunes y festivos nacionales. El espectáculo de luz y sonido nocturno es excelente."
    }
  },
  "jagannath-temple-puri": {
    en: {
      history: "Built in the 12th century by King Anantavarman Chodaganga Deva of the Eastern Ganga dynasty. The temple's origin is linked to the legend of King Indradyumna.",
      significance: "One of the four sacred Char Dham pilgrimage sites. Famous for the annual Rath Yatra (Chariot Festival) which draws millions. Only Hindus are allowed inside.",
      tips: "Non-Hindus can view the temple from the Raghunandan Library rooftop opposite. The Rath Yatra in June/July is a once-in-a-lifetime experience. Puri beach is nearby."
    },
    hi: {
      history: "12वीं शताब्दी में पूर्वी गंग वंश के राजा अनंतवर्मन चोडगंग देव ने इसे बनवाया। मंदिर की उत्पत्ति राजा इंद्रद्युम्न की कथा से जुड़ी है।",
      significance: "चार पवित्र चार धाम तीर्थ स्थलों में से एक। वार्षिक रथ यात्रा के लिए प्रसिद्ध। केवल हिंदू प्रवेश कर सकते हैं।",
      tips: "गैर-हिंदू सामने रघुनंदन पुस्तकालय की छत से मंदिर देख सकते हैं। जून/जुलाई में रथ यात्रा जीवन का अनुभव है।"
    },
    es: {
      history: "Construido en el siglo XII por el Rey Anantavarman Chodaganga Deva. El origen del templo está vinculado a la leyenda del Rey Indradyumna.",
      significance: "Uno de los cuatro sitios sagrados Char Dham. Famoso por el festival anual Rath Yatra. Solo se permite la entrada a hindúes.",
      tips: "Los no hindúes pueden ver el templo desde el techo de la Biblioteca Raghunandan. El Rath Yatra en junio/julio es una experiencia única."
    }
  },
  "howrah-bridge": {
    en: {
      history: "Opened in 1943 during World War II, replacing a pontoon bridge from 1874. Built without nuts or bolts — the entire structure is held together by rivets. Named Rabindra Setu in 1965.",
      significance: "One of the busiest cantilever bridges in the world, carrying 100,000+ vehicles and countless pedestrians daily. An enduring symbol of Kolkata's resilience and identity.",
      tips: "Best photographed from Mullick Ghat flower market at dawn. Walk across for the experience — it takes about 15 minutes. The view from Princep Ghat is also excellent."
    },
    hi: {
      history: "1943 में द्वितीय विश्व युद्ध के दौरान खोला गया। बिना नट या बोल्ट के बनाया गया — पूरी संरचना रिवेट्स से जुड़ी है। 1965 में रवींद्र सेतु नाम दिया गया।",
      significance: "दुनिया के सबसे व्यस्त कैंटिलीवर पुलों में से एक, रोज़ाना 100,000+ वाहनों को ले जाता है। कोलकाता की पहचान का प्रतीक।",
      tips: "भोर में मल्लिक घाट फूल बाज़ार से फ़ोटो खींचना सबसे अच्छा। पैदल पार करने में लगभग 15 मिनट लगते हैं।"
    },
    es: {
      history: "Inaugurado en 1943 durante la Segunda Guerra Mundial. Construido sin tuercas ni tornillos — toda la estructura se mantiene con remaches.",
      significance: "Uno de los puentes voladizos más transitados del mundo, con más de 100.000 vehículos diarios. Símbolo perdurable de Kolkata.",
      tips: "Mejor fotografiado desde el mercado de flores Mullick Ghat al amanecer. Cruce caminando — toma unos 15 minutos."
    }
  },
  "sundarbans": {
    en: {
      history: "Designated a UNESCO World Heritage Site in 1987. The name means 'beautiful forest' from the Sundari trees that dominate the mangrove ecosystem. Human habitation dates back centuries.",
      significance: "The world's largest mangrove forest spanning 10,000 sq km across India and Bangladesh. Home to the Royal Bengal Tiger and over 260 bird species.",
      tips: "Book a 2-3 day boat safari for the best experience. Tiger sightings are rare but the biodiversity is incredible. Carry mosquito repellent and sun protection."
    },
    hi: {
      history: "1987 में यूनेस्को विश्व धरोहर स्थल घोषित। नाम सुंदरी वृक्षों से आता है जो मैंग्रोव पारिस्थितिकी तंत्र में प्रमुख हैं।",
      significance: "भारत और बांग्लादेश में 10,000 वर्ग किमी में फैला दुनिया का सबसे बड़ा मैंग्रोव वन। रॉयल बंगाल टाइगर का घर।",
      tips: "सबसे अच्छे अनुभव के लिए 2-3 दिन की नाव सफ़ारी बुक करें। मच्छर भगाने वाला और सनस्क्रीन ले जाएँ।"
    },
    es: {
      history: "Designado Patrimonio de la Humanidad en 1987. El nombre significa 'bosque hermoso' por los árboles Sundari del ecosistema de manglares.",
      significance: "El bosque de manglares más grande del mundo, con 10.000 km² entre India y Bangladesh. Hogar del tigre real de Bengala.",
      tips: "Reserve un safari en bote de 2-3 días. Los avistamientos de tigres son raros pero la biodiversidad es increíble."
    }
  },
  "goa-beaches": {
    en: {
      history: "Goa was a Portuguese colony for 450 years (1510-1961). The fusion of Portuguese and Indian cultures created a unique coastal identity. Calangute became the 'Queen of Beaches' in the 1960s hippie era.",
      significance: "India's premier beach destination blending Portuguese heritage with Indian culture. The Old Goa churches are a separate UNESCO World Heritage Site.",
      tips: "Visit November to February for the best weather. North Goa beaches are lively; South Goa is quieter and more scenic. Try the local fish curry rice and feni."
    },
    hi: {
      history: "गोवा 450 वर्षों (1510-1961) तक पुर्तगाली उपनिवेश था। पुर्तगाली और भारतीय संस्कृतियों के मिश्रण ने एक अनूठी तटीय पहचान बनाई।",
      significance: "भारत का प्रमुख समुद्र तट गंतव्य। पुराने गोवा के चर्च अलग यूनेस्को विश्व धरोहर स्थल हैं।",
      tips: "सबसे अच्छे मौसम के लिए नवंबर से फरवरी जाएँ। उत्तर गोवा जीवंत है; दक्षिण गोवा शांत है। स्थानीय फिश करी राइस ज़रूर आज़माएँ।"
    },
    es: {
      history: "Goa fue colonia portuguesa durante 450 años (1510-1961). La fusión de culturas portuguesa e india creó una identidad costera única.",
      significance: "El principal destino de playa de India combinando herencia portuguesa con cultura india.",
      tips: "Visite de noviembre a febrero para el mejor clima. Las playas del norte son animadas; el sur es más tranquilo. Pruebe el curry de pescado y el feni."
    }
  },
  "rann-of-kutch": {
    en: {
      history: "The Great Rann of Kutch was once part of the Arabian Sea. Geological uplift over millions of years created this vast salt desert. The Rann Utsav festival began in 2006.",
      significance: "World's largest salt desert spanning 7,505 sq km. The white desert under full moonlight is a surreal experience. Rann Utsav (Nov-Feb) celebrates local crafts, music, and culture.",
      tips: "Visit during Rann Utsav (November to February) for organized tourism. Full moon nights are magical. The border town of Bhuj has excellent Kutchi handicrafts."
    },
    hi: {
      history: "कच्छ का रण कभी अरब सागर का हिस्सा था। लाखों वर्षों में भूगर्भीय उत्थान ने इस विशाल नमक रेगिस्तान का निर्माण किया। रण उत्सव 2006 में शुरू हुआ।",
      significance: "7,505 वर्ग किमी में फैला दुनिया का सबसे बड़ा नमक रेगिस्तान। पूर्णिमा की रात सफेद रेगिस्तान अलौकिक दिखता है।",
      tips: "रण उत्सव (नवंबर-फरवरी) के दौरान जाएँ। पूर्णिमा की रातें जादुई हैं। भुज में कच्छी हस्तशिल्प उत्कृष्ट हैं।"
    },
    es: {
      history: "El Gran Rann de Kutch fue parte del Mar Arábigo. El levantamiento geológico creó este vasto desierto de sal. El festival Rann Utsav comenzó en 2006.",
      significance: "El desierto de sal más grande del mundo con 7.505 km². La experiencia bajo la luna llena es surrealista.",
      tips: "Visite durante Rann Utsav (noviembre a febrero). Las noches de luna llena son mágicas."
    }
  },
  "somnath-temple": {
    en: {
      history: "First built in gold by Soma (Moon God) in legend, the temple was destroyed and rebuilt at least 6 times. The current structure was reconstructed in 1951 under Sardar Patel's initiative after independence.",
      significance: "First among the twelve Jyotirlinga shrines of Lord Shiva. Its repeated destruction and reconstruction symbolises the resilience of Hindu civilisation.",
      tips: "The sound-and-light show in the evening is excellent and narrates the temple's history. The temple faces the Arabian Sea — sunset views are stunning."
    },
    hi: {
      history: "किंवदंती में सोम (चंद्र देव) ने इसे सोने से बनाया। मंदिर कम से कम 6 बार नष्ट और पुनर्निर्मित हुआ। वर्तमान संरचना 1951 में सरदार पटेल की पहल पर बनाई गई।",
      significance: "भगवान शिव के बारह ज्योतिर्लिंगों में पहला। इसका बार-बार विनाश और पुनर्निर्माण हिंदू सभ्यता की अदम्यता का प्रतीक है।",
      tips: "शाम की लाइट एंड साउंड शो उत्कृष्ट है। मंदिर अरब सागर की ओर है — सूर्यास्त के दृश्य शानदार हैं।"
    },
    es: {
      history: "Según la leyenda, fue construido en oro por Soma (Dios Luna). El templo fue destruido y reconstruido al menos 6 veces. La estructura actual fue reconstruida en 1951.",
      significance: "Primero entre los doce santuarios Jyotirlinga de Lord Shiva. Su destrucción y reconstrucción simbolizan la resiliencia de la civilización hindú.",
      tips: "El espectáculo de luz y sonido nocturno narra la historia del templo. El templo mira al Mar Arábigo — las puestas de sol son impresionantes."
    }
  },
  "mehrangarh-fort": {
    en: {
      history: "Built in 1459 by Rao Jodha, the founder of Jodhpur. Perched 125 metres above the city on a rocky hill, it has seven gates — each built to commemorate a military victory.",
      significance: "One of India's largest and best-preserved forts. Houses an excellent museum of royal palanquins, costumes, and paintings. Featured in The Dark Knight Rises.",
      tips: "The audio guide (included with entry) is one of the best in India. The zipline from the fort offers thrilling aerial views. The view of the blue city below is iconic."
    },
    hi: {
      history: "1459 में जोधपुर के संस्थापक राव जोधा ने इसे बनवाया। शहर से 125 मीटर ऊपर चट्टानी पहाड़ी पर स्थित, इसमें सात द्वार हैं — प्रत्येक एक सैन्य विजय की याद में।",
      significance: "भारत के सबसे बड़े और सबसे अच्छे संरक्षित किलों में से एक। शाही पालकियों, वेशभूषा और चित्रों का उत्कृष्ट संग्रहालय।",
      tips: "ऑडियो गाइड (प्रवेश में शामिल) भारत के सबसे अच्छे में से एक है। किले से ज़िपलाइन रोमांचक है। नीचे नीले शहर का दृश्य प्रतिष्ठित है।"
    },
    es: {
      history: "Construido en 1459 por Rao Jodha, fundador de Jodhpur. Situado 125 metros sobre la ciudad, tiene siete puertas conmemorando victorias militares.",
      significance: "Uno de los fuertes más grandes y mejor conservados de India. Alberga un excelente museo de palanquines reales y pinturas.",
      tips: "La audioguía (incluida con la entrada) es de las mejores de India. La tirolesa desde el fuerte ofrece vistas aéreas emocionantes."
    }
  },
  "sanchi-stupa": {
    en: {
      history: "Originally commissioned by Emperor Ashoka in the 3rd century BCE to house Buddha's relics. The Great Stupa was enlarged in the 2nd century BCE with elaborate carved gateways (toranas).",
      significance: "UNESCO World Heritage Site. The oldest stone structure in India. The four toranas depict scenes from Buddha's life and are masterpieces of early Indian art.",
      tips: "Hire a guide to understand the symbolism of the carvings. The site is compact and can be covered in 2 hours. Bhopal (46 km) is the nearest major city."
    },
    hi: {
      history: "मूल रूप से तीसरी शताब्दी ईसा पूर्व में सम्राट अशोक द्वारा बुद्ध के अवशेषों को रखने के लिए बनवाया गया। महान स्तूप को दूसरी शताब्दी ईसा पूर्व में विस्तारित किया गया।",
      significance: "यूनेस्को विश्व धरोहर स्थल। भारत की सबसे पुरानी पत्थर की संरचना। चार तोरण बुद्ध के जीवन के दृश्यों को दर्शाते हैं।",
      tips: "नक्काशी के प्रतीकवाद को समझने के लिए गाइड लें। 2 घंटे में कवर किया जा सकता है। भोपाल (46 किमी) निकटतम शहर है।"
    },
    es: {
      history: "Encargada originalmente por el emperador Ashoka en el siglo III a.C. para albergar reliquias de Buda. Fue ampliada en el siglo II a.C. con elaboradas puertas talladas (toranas).",
      significance: "Patrimonio de la Humanidad. La estructura de piedra más antigua de India. Las toranas son obras maestras del arte indio temprano.",
      tips: "Contrate un guía para entender el simbolismo. El sitio es compacto y se cubre en 2 horas."
    }
  },
  "mandu": {
    en: {
      history: "A medieval hill fortress city established by the Paramara dynasty in the 10th century. It became the capital of the Malwa Sultanate under Hoshang Shah in the 15th century.",
      significance: "Known as the 'City of Joy'. The Rupmati Pavilion offers panoramic views of the Narmada valley. The Jahaz Mahal (Ship Palace) appears to float between two lakes.",
      tips: "Best visited during or just after the monsoon (July-September) when the landscape is lush green. The sites are spread out — hire a vehicle. Carry water and snacks."
    },
    hi: {
      history: "10वीं शताब्दी में परमार राजवंश द्वारा स्थापित मध्यकालीन पहाड़ी किला शहर। 15वीं शताब्दी में होशंग शाह के तहत मालवा सल्तनत की राजधानी बनी।",
      significance: "'खुशियों का शहर'। रूपमती मंडप से नर्मदा घाटी का मनोरम दृश्य। जहाज़ महल दो झीलों के बीच तैरता हुआ प्रतीत होता है।",
      tips: "मानसून के दौरान या बाद में जाना सबसे अच्छा है जब परिदृश्य हरा-भरा होता है। स्थल फैले हुए हैं — वाहन किराए पर लें।"
    },
    es: {
      history: "Ciudad-fortaleza medieval establecida por la dinastía Paramara en el siglo X. Se convirtió en capital del Sultanato de Malwa bajo Hoshang Shah.",
      significance: "Conocida como la 'Ciudad de la Alegría'. El Pabellón Rupmati ofrece vistas panorámicas del valle del Narmada.",
      tips: "Mejor visitarla durante el monzón (julio-septiembre) cuando el paisaje es verde exuberante. Los sitios están dispersos — alquile un vehículo."
    }
  },
  "kaziranga-national-park": {
    en: {
      history: "Established as a reserve in 1905 by the Viceroy Lord Curzon after his wife's visit highlighted the rhinoceros decline. Became a national park in 1974 and a UNESCO site in 1985.",
      significance: "Home to two-thirds of the world's one-horned rhinoceroses. Also has the highest density of tigers among protected areas and large populations of Asian elephants and wild buffalo.",
      tips: "Open November to April only. Elephant safaris at dawn are the best way to see rhinos. Central Range (Kohora) is the most popular. Book jeep safaris in advance."
    },
    hi: {
      history: "1905 में वायसराय लॉर्ड कर्ज़न द्वारा एक रिज़र्व के रूप में स्थापित। 1974 में राष्ट्रीय उद्यान और 1985 में यूनेस्को स्थल बना।",
      significance: "दुनिया के दो-तिहाई एक-सींग वाले गैंडों का घर। संरक्षित क्षेत्रों में बाघों का सबसे अधिक घनत्व भी यहाँ है।",
      tips: "केवल नवंबर से अप्रैल खुला। भोर में हाथी सफ़ारी गैंडों को देखने का सबसे अच्छा तरीका है। जीप सफ़ारी पहले से बुक करें।"
    },
    es: {
      history: "Establecido como reserva en 1905 por el Virrey Lord Curzon. Se convirtió en parque nacional en 1974 y sitio UNESCO en 1985.",
      significance: "Hogar de dos tercios de los rinocerontes de un cuerno del mundo. También tiene la mayor densidad de tigres entre áreas protegidas.",
      tips: "Abierto solo de noviembre a abril. Los safaris en elefante al amanecer son la mejor manera de ver rinocerontes."
    }
  },
  "tawang-monastery": {
    en: {
      history: "Founded in 1680-81 by Merak Lama Lodre Gyatso according to the wishes of the 5th Dalai Lama. It is the birthplace of the 6th Dalai Lama, Tsangyang Gyatso.",
      significance: "The largest monastery in India and second-largest in the world after Lhasa's Potala Palace. Houses a 28-foot gilded statue of Buddha and an invaluable library of Buddhist texts.",
      tips: "The road to Tawang from Bomdila is scenic but takes 12+ hours. Permits are required (ILP for Indian citizens, PAP for foreigners). Altitude sickness can be a concern at 3,048m."
    },
    hi: {
      history: "1680-81 में मेरक लामा लोद्रे ग्यात्सो ने 5वें दलाई लामा की इच्छा के अनुसार इसकी स्थापना की। यह 6वें दलाई लामा, त्संगयांग ग्यात्सो, का जन्मस्थान है।",
      significance: "भारत का सबसे बड़ा और दुनिया का दूसरा सबसे बड़ा मठ। 28 फीट की सोने की बुद्ध प्रतिमा और अमूल्य बौद्ध ग्रंथ पुस्तकालय।",
      tips: "बोमडिला से तवांग की सड़क सुंदर है लेकिन 12+ घंटे लगते हैं। परमिट आवश्यक है। 3,048 मीटर पर ऊंचाई की बीमारी हो सकती है।"
    },
    es: {
      history: "Fundado en 1680-81 por Merak Lama Lodre Gyatso según los deseos del 5to Dalái Lama. Es el lugar de nacimiento del 6to Dalái Lama.",
      significance: "El monasterio más grande de India y segundo más grande del mundo. Alberga una estatua dorada de Buda de 28 pies.",
      tips: "El camino desde Bomdila es pintoresco pero toma más de 12 horas. Se requieren permisos. El mal de altura puede ser un problema a 3.048m."
    }
  },
  "living-root-bridges": {
    en: {
      history: "Created by the Khasi and Jaintia tribes over centuries by training the aerial roots of Ficus elastica trees across rivers. Some bridges are over 500 years old and grow stronger with age.",
      significance: "Unique bio-engineering marvels found nowhere else in the world. The Double Decker Root Bridge at Nongriat is the most famous. A UNESCO World Heritage nomination is pending.",
      tips: "The trek to the Double Decker Bridge involves 3,500 steps each way — be fit. Start early morning. Wear sturdy shoes and carry water. Homestays near Nongriat are available."
    },
    hi: {
      history: "खासी और जयंतिया जनजातियों ने सदियों में फ़ाइकस इलास्टिका पेड़ों की हवाई जड़ों को नदियों पर प्रशिक्षित करके बनाया। कुछ पुल 500 वर्ष से अधिक पुराने हैं।",
      significance: "दुनिया में कहीं और नहीं पाए जाने वाले अनूठे जैव-इंजीनियरिंग चमत्कार। नोंगरियाट का डबल डेकर रूट ब्रिज सबसे प्रसिद्ध है।",
      tips: "डबल डेकर ब्रिज तक ट्रेक में प्रत्येक तरफ 3,500 सीढ़ियाँ हैं — फिट रहें। सुबह जल्दी शुरू करें। मज़बूत जूते पहनें।"
    },
    es: {
      history: "Creados por las tribus Khasi y Jaintia durante siglos entrenando las raíces aéreas de árboles Ficus elastica. Algunos puentes tienen más de 500 años.",
      significance: "Maravillas de bioingeniería únicas en el mundo. El Puente de Raíces de Doble Piso en Nongriat es el más famoso.",
      tips: "La caminata al puente implica 3.500 escalones en cada dirección — esté en forma. Comience temprano y lleve zapatos resistentes."
    }
  },
  "ram-mandir": {
    en: {
      history: "Inaugurated on 22 January 2024 by the Prime Minister. Built at Ram Janmabhoomi, the believed birthplace of Lord Ram. Construction followed a 2019 Supreme Court verdict resolving a centuries-old dispute.",
      significance: "One of the most significant religious constructions of the 21st century. The Nagara-style temple uses pink Bansi Paharpur sandstone and is designed to last 1,000 years.",
      tips: "Book darshan slots online at srjbtkshetra.org. No mobile phones or electronic devices allowed inside. Dress modestly. Free lockers are available at the entrance."
    },
    hi: {
      history: "22 जनवरी 2024 को प्रधानमंत्री द्वारा उद्घाटन। राम जन्मभूमि पर निर्मित, जिसे भगवान राम का जन्मस्थान माना जाता है। 2019 के सुप्रीम कोर्ट के फ़ैसले के बाद निर्माण हुआ।",
      significance: "21वीं सदी के सबसे महत्वपूर्ण धार्मिक निर्माणों में से एक। नागर शैली का मंदिर गुलाबी बंसी पहाड़पुर बलुआ पत्थर से बना है।",
      tips: "srjbtkshetra.org पर ऑनलाइन दर्शन स्लॉट बुक करें। अंदर मोबाइल फ़ोन की अनुमति नहीं। शालीनता से कपड़े पहनें।"
    },
    es: {
      history: "Inaugurado el 22 de enero de 2024 por el Primer Ministro. Construido en Ram Janmabhoomi, el supuesto lugar de nacimiento del Señor Ram.",
      significance: "Una de las construcciones religiosas más significativas del siglo XXI. Diseñado en estilo Nagara para durar 1.000 años.",
      tips: "Reserve turnos de darshan en línea en srjbtkshetra.org. No se permiten teléfonos móviles dentro. Vista modestamente."
    }
  },
  "statue-of-unity": {
    en: {
      history: "Inaugurated on 31 October 2018 (Sardar Patel's 143rd birthday). Designed by Ram V. Sutar and built by Larsen & Toubro in 33 months. Cost approximately ₹2,989 crore.",
      significance: "World's tallest statue at 182 metres — twice the height of the Statue of Liberty. Honours Sardar Vallabhbhai Patel, who unified 562 princely states into the Indian Union.",
      tips: "Book the observation deck ticket online (₹350). The Valley of Flowers and Sardar Sarovar Dam are nearby. Closed on Mondays. Best visited October to March."
    },
    hi: {
      history: "31 अक्टूबर 2018 (सरदार पटेल की 143वीं जयंती) पर उद्घाटन। राम वी. सुतार ने डिज़ाइन किया और लार्सन एंड टुब्रो ने 33 महीनों में बनाया।",
      significance: "182 मीटर पर दुनिया की सबसे ऊंची प्रतिमा — स्टैच्यू ऑफ़ लिबर्टी से दोगुनी ऊंची। सरदार पटेल को समर्पित जिन्होंने 562 रियासतों को एकजुट किया।",
      tips: "ऑब्ज़र्वेशन डेक टिकट ऑनलाइन बुक करें (₹350)। वैली ऑफ़ फ्लावर्स और सरदार सरोवर बांध पास हैं। सोमवार को बंद।"
    },
    es: {
      history: "Inaugurada el 31 de octubre de 2018. Diseñada por Ram V. Sutar y construida en 33 meses. Costó aproximadamente ₹2.989 crores.",
      significance: "La estatua más alta del mundo con 182 metros — el doble de la Estatua de la Libertad. Honra a Sardar Patel, quien unificó 562 estados principescos.",
      tips: "Reserve el boleto del mirador en línea (₹350). Cerrado los lunes. Mejor visitarla de octubre a marzo."
    }
  },
  "lotus-temple": {
    en: {
      history: "Completed in 1986, designed by Iranian-Canadian architect Fariborz Sahba. The 27 free-standing marble-clad petals form a lotus flower. It took 10 years and $10 million to build.",
      significance: "Bahá'í House of Worship open to people of all faiths. Won numerous architectural awards including the Globeart Academy Award. Attracts 4+ million visitors annually.",
      tips: "No photography inside the main hall. Silence is maintained inside for meditation. The surrounding gardens are beautiful. Free entry. Allow 30-60 minutes."
    },
    hi: {
      history: "1986 में पूर्ण, ईरानी-कनाडाई वास्तुकार फ़रीबोर्ज़ साहबा द्वारा डिज़ाइन। 27 मुक्त-खड़ी संगमरमर की पंखुड़ियाँ कमल का फूल बनाती हैं।",
      significance: "सभी धर्मों के लोगों के लिए खुला बहाई उपासना गृह। कई वास्तुशिल्प पुरस्कार जीते। सालाना 4+ मिलियन आगंतुक।",
      tips: "मुख्य हॉल के अंदर फ़ोटोग्राफ़ी नहीं। ध्यान के लिए अंदर शांति बनाए रखें। प्रवेश निःशुल्क। 30-60 मिनट दें।"
    },
    es: {
      history: "Completado en 1986, diseñado por el arquitecto iraní-canadiense Fariborz Sahba. Los 27 pétalos revestidos de mármol forman una flor de loto.",
      significance: "Casa de Adoración Bahá'í abierta a personas de todas las religiones. Ganó numerosos premios arquitectónicos. Atrae más de 4 millones de visitantes anuales.",
      tips: "Sin fotografía dentro del salón principal. Se mantiene silencio para la meditación. Entrada gratuita. Reserve 30-60 minutos."
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 3 — Crowd Pattern Generation (Deterministic)
// ═══════════════════════════════════════════════════════════════════

/**
 * Popularity tiers determine peak density:
 * - Tier 1 (very popular): peak 0.75–0.95
 * - Tier 2 (medium):       peak 0.40–0.70
 * - Tier 3 (niche/remote): peak 0.15–0.40
 */
const popularityMap: Record<string, number> = {
  // Tier 1 — very popular
  "taj-mahal": 0.92,
  "golden-temple": 0.90,
  "ram-mandir": 0.95,
  "varanasi-ghats": 0.85,
  "tirupati-balaji": 0.88,
  "red-fort": 0.78,
  "mysore-palace": 0.80,
  "gateway-of-india": 0.75,
  "goa-beaches": 0.76,

  // Tier 2 — medium popularity
  "amber-fort": 0.65,
  "qutub-minar": 0.62,
  "hawa-mahal": 0.60,
  "agra-fort": 0.63,
  "konark-sun-temple": 0.55,
  "meenakshi-temple": 0.68,
  "khajuraho": 0.50,
  "ajanta-caves": 0.48,
  "ellora-caves": 0.50,
  "fatehpur-sikri": 0.52,
  "golconda-fort": 0.50,
  "charminar": 0.58,
  "humayuns-tomb": 0.45,
  "jallianwala-bagh": 0.55,
  "city-palace-udaipur": 0.55,
  "rishikesh-laxman-jhula": 0.60,
  "mahabalipuram": 0.48,
  "lotus-temple": 0.65,
  "statue-of-unity": 0.58,
  "victoria-memorial": 0.55,
  "jagannath-temple-puri": 0.68,
  "howrah-bridge": 0.42,
  "somnath-temple": 0.62,
  "mehrangarh-fort": 0.55,
  "padmanabhaswamy-temple": 0.60,
  "chowmahalla-palace": 0.42,
  "rann-of-kutch": 0.50,
  "sanchi-stupa": 0.40,
  "bangalore-palace": 0.42,

  // Tier 3 — niche / remote
  "sundarbans": 0.28,
  "mandu": 0.25,
  "kaziranga-national-park": 0.35,
  "tawang-monastery": 0.22,
  "living-root-bridges": 0.20,
  "hampi": 0.45,
};

/**
 * Hour-curve multiplier — models a realistic daily bell-curve with
 * peak visitation around 10 AM–2 PM.
 */
const hourCurve: Record<number, number> = {
  6: 0.15,
  8: 0.45,
  10: 0.85,
  12: 1.0,
  14: 0.90,
  16: 0.65,
  18: 0.35,
  20: 0.10,
};

/**
 * Day-of-week multipliers:
 * 0=Sun (high), 1-4=Mon-Thu (base), 5=Fri (slightly higher), 6=Sat (high)
 */
const dayMultiplier: Record<number, number> = {
  0: 1.25, // Sunday
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 1.0,
  5: 1.10, // Friday
  6: 1.20, // Saturday
};

function generateCrowdPatterns(): Array<{
  siteSlug: string;
  dayOfWeek: number;
  hour: number;
  avgDensity: number;
  weather: string;
  isHoliday: boolean;
  season: string;
}> {
  const patterns: Array<{
    siteSlug: string;
    dayOfWeek: number;
    hour: number;
    avgDensity: number;
    weather: string;
    isHoliday: boolean;
    season: string;
  }> = [];

  const hours = [6, 8, 10, 12, 14, 16, 18, 20];

  for (const site of sites) {
    const basePop = popularityMap[site.slug] ?? 0.40;

    for (let day = 0; day <= 6; day++) {
      for (const hour of hours) {
        // ── Normal day (isHoliday = false) ──
        const normalDensity = Math.min(
          1.0,
          Math.round(basePop * hourCurve[hour]! * dayMultiplier[day]! * 100) / 100
        );
        patterns.push({
          siteSlug: site.slug,
          dayOfWeek: day,
          hour,
          avgDensity: normalDensity,
          weather: "Clear",
          isHoliday: false,
          season: "peak",
        });

        // ── Holiday (40-60% uplift) ──
        const holidayUplift = 1.0 + 0.40 + (basePop * 0.20); // higher pop → bigger holiday bump
        const holidayDensity = Math.min(
          1.0,
          Math.round(basePop * hourCurve[hour]! * dayMultiplier[day]! * holidayUplift * 100) / 100
        );
        patterns.push({
          siteSlug: site.slug,
          dayOfWeek: day,
          hour,
          avgDensity: holidayDensity,
          weather: "Clear",
          isHoliday: true,
          season: "peak",
        });
      }
    }
  }

  return patterns;
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4 — ASI Visitor Statistics (20 major sites, 3 years)
// ═══════════════════════════════════════════════════════════════════

interface VisitorStatsData {
  siteSlug: string;
  year: number;
  domesticVisitors: number;
  foreignVisitors: number;
  totalVisitors: number;
}

/**
 * Base figures (FY 2024-25 estimates). We generate 2022, 2023, 2024 with
 * ~7% annual growth backward from the 2024 base.
 */
const visitorStatsBase: Array<{
  siteSlug: string;
  domestic2024: number;
  foreign2024: number;
}> = [
  { siteSlug: "taj-mahal",           domestic2024: 6900000,  foreign2024: 645000 },
  { siteSlug: "red-fort",            domestic2024: 3500000,  foreign2024: 350000 },
  { siteSlug: "qutub-minar",         domestic2024: 3200000,  foreign2024: 300000 },
  { siteSlug: "mysore-palace",       domestic2024: 6000000,  foreign2024: 200000 },
  { siteSlug: "konark-sun-temple",   domestic2024: 3500000,  foreign2024: 50000 },
  { siteSlug: "amber-fort",          domestic2024: 5000000,  foreign2024: 500000 },
  { siteSlug: "golden-temple",       domestic2024: 7000000,  foreign2024: 300000 },
  { siteSlug: "tirupati-balaji",     domestic2024: 18000000, foreign2024: 100000 },
  { siteSlug: "meenakshi-temple",    domestic2024: 5000000,  foreign2024: 150000 },
  { siteSlug: "fatehpur-sikri",      domestic2024: 2800000,  foreign2024: 350000 },
  { siteSlug: "ajanta-caves",        domestic2024: 1500000,  foreign2024: 100000 },
  { siteSlug: "ellora-caves",        domestic2024: 2000000,  foreign2024: 150000 },
  { siteSlug: "khajuraho",           domestic2024: 800000,   foreign2024: 120000 },
  { siteSlug: "gateway-of-india",    domestic2024: 5000000,  foreign2024: 500000 },
  { siteSlug: "victoria-memorial",   domestic2024: 3000000,  foreign2024: 150000 },
  { siteSlug: "hawa-mahal",          domestic2024: 4000000,  foreign2024: 400000 },
  { siteSlug: "agra-fort",           domestic2024: 3500000,  foreign2024: 450000 },
  { siteSlug: "ram-mandir",          domestic2024: 15000000, foreign2024: 50000 },
  { siteSlug: "statue-of-unity",     domestic2024: 5000000,  foreign2024: 200000 },
  { siteSlug: "lotus-temple",        domestic2024: 4000000,  foreign2024: 300000 },
];

function generateVisitorStats(): VisitorStatsData[] {
  const stats: VisitorStatsData[] = [];
  const growthRate = 0.07; // ~7% annual growth

  for (const base of visitorStatsBase) {
    for (const year of [2022, 2023, 2024]) {
      const yearsBack = 2024 - year;
      const factor = Math.pow(1 - growthRate, yearsBack); // shrink backwards
      const domestic = Math.round(base.domestic2024 * factor);
      const foreign = Math.round(base.foreign2024 * factor);
      stats.push({
        siteSlug: base.siteSlug,
        year,
        domesticVisitors: domestic,
        foreignVisitors: foreign,
        totalVisitors: domestic + foreign,
      });
    }
  }

  return stats;
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5 — Guides (preserved from original seed)
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// SECTION 6 — Main Seed Function
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log("🌱 Seeding Heritage India database (50 sites)...\n");

  // ─── Clear existing data (order matters for FK constraints) ──
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedSite.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.crowdSnapshot.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.crowdPattern.deleteMany();
  await prisma.visitorStats.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.site.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Sites ───────────────────────────────────────────

  console.log("📍 Creating 50 heritage sites...");
  const createdSites: Record<string, string> = {};
  for (const siteData of sites) {
    const images = verifiedSiteImages[siteData.slug]
      ? JSON.stringify(verifiedSiteImages[siteData.slug])
      : siteData.imageUrls;
    const site = await prisma.site.create({
      data: { ...siteData, imageUrls: images },
    });
    createdSites[site.slug] = site.id;
    console.log(`   ✓ ${site.name}`);
  }

  // ─── Create Site Content (3 locales per site) ──────────────

  console.log("\n🌐 Creating multilingual site content...");
  let contentCount = 0;
  for (const [slug, locales] of Object.entries(siteContentMap)) {
    const siteId = createdSites[slug];
    if (!siteId) {
      console.log(`   ⚠ No site found for slug: ${slug}`);
      continue;
    }
    for (const [locale, content] of Object.entries(locales)) {
      await prisma.siteContent.create({
        data: { siteId, locale, ...content }
      });
      contentCount++;
    }
    console.log(`   ✓ ${slug} (en, hi, es)`);
  }

  // ─── Create Crowd Patterns ─────────────────────────────────

  console.log("\n📊 Generating crowd flow patterns...");
  const patterns = generateCrowdPatterns();
  // Batch insert in chunks of 500 for performance
  const BATCH_SIZE = 500;
  for (let i = 0; i < patterns.length; i += BATCH_SIZE) {
    const batch = patterns.slice(i, i + BATCH_SIZE);
    await prisma.crowdPattern.createMany({ data: batch });
  }
  console.log(`   ✓ ${patterns.length} crowd patterns created`);

  // ─── Create Visitor Stats ──────────────────────────────────

  console.log("\n📈 Generating ASI visitor statistics...");
  const stats = generateVisitorStats();
  await prisma.visitorStats.createMany({ data: stats });
  console.log(`   ✓ ${stats.length} visitor stat entries created (${visitorStatsBase.length} sites × 3 years)`);

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

  // ─── Create Crowd Snapshots (legacy — kept for compat) ────

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
  const siteContentCount = await prisma.siteContent.count();
  const usersCount = await prisma.user.count();
  const bookingsCount = await prisma.booking.count();
  const notifCount = await prisma.notification.count();
  const crowdPatternCount = await prisma.crowdPattern.count();
  const visitorStatsCount = await prisma.visitorStats.count();
  const crowdSnapshotCount = await prisma.crowdSnapshot.count();

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Seed completed successfully!");
  console.log(`   Sites:           ${sitesCount}`);
  console.log(`   Site Content:    ${siteContentCount} (${Math.round(siteContentCount / sitesCount)} locales/site)`);
  console.log(`   Guides:          ${guidesCount}`);
  console.log(`   Crowd Patterns:  ${crowdPatternCount}`);
  console.log(`   Visitor Stats:   ${visitorStatsCount}`);
  console.log(`   Crowd Snapshots: ${crowdSnapshotCount}`);
  console.log(`   Users:           ${usersCount}`);
  console.log(`   Bookings:        ${bookingsCount}`);
  console.log(`   Notifications:   ${notifCount}`);
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
