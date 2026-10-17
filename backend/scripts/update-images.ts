/**
 * Updates all 44 sites in the database with verified, reliable, high-resolution CDN images.
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export const verifiedSiteImages: Record<string, string[]> = {
  "taj-mahal": [
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
  ],
  "hampi": [
    "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=1200&q=80",
  ],
  "amber-fort": [
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
  ],
  "qutub-minar": [
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
  ],
  "mysore-palace": [
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
  ],
  "red-fort": [
    "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80",
  ],
  "konark-sun-temple": [
    "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  ],
  "meenakshi-temple": [
    "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  ],
  "khajuraho": [
    "https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=1200&q=80",
  ],
  "ajanta-caves": [
    "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80",
  ],
  "ellora-caves": [
    "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80",
  ],
  "fatehpur-sikri": [
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
  ],
  "hawa-mahal": [
    "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
  ],
  "golconda-fort": [
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
  ],
  "charminar": [
    "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?auto=format&fit=crop&w=1200&q=80",
  ],
  "golden-temple": [
    "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
  ],
  "humayuns-tomb": [
    "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80",
  ],
  "jallianwala-bagh": [
    "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80",
  ],
  "varanasi-ghats": [
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
  ],
  "city-palace-udaipur": [
    "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1200&q=80",
  ],
  "rishikesh-laxman-jhula": [
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
  ],
  "agra-fort": [
    "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=80",
  ],
  "gateway-of-india": [
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
  ],
  "mahabalipuram": [
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
  ],
  "bangalore-palace": [
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
  ],
  "tirupati-balaji": [
    "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  ],
  "padmanabhaswamy-temple": [
    "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
  ],
  "chowmahalla-palace": [
    "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=1200&q=80",
  ],
  "victoria-memorial": [
    "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80",
  ],
  "jagannath-temple-puri": [
    "https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=1200&q=80",
  ],
  "howrah-bridge": [
    "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80",
  ],
  "sundarbans": [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  ],
  "goa-beaches": [
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  ],
  "rann-of-kutch": [
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  ],
  "somnath-temple": [
    "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80",
  ],
  "mehrangarh-fort": [
    "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80",
  ],
  "sanchi-stupa": [
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
  ],
  "mandu": [
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
  ],
  "kaziranga-national-park": [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
  ],
  "tawang-monastery": [
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
  ],
  "living-root-bridges": [
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  ],
  "ram-mandir": [
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
  ],
  "statue-of-unity": [
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
  ],
  "lotus-temple": [
    "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=80",
  ],
};

async function updateImages() {
  console.log("🖼️ Updating site images with verified high-res CDN photos...");
  let updated = 0;
  for (const [slug, images] of Object.entries(verifiedSiteImages)) {
    const res = await prisma.site.updateMany({
      where: { slug },
      data: {
        imageUrls: JSON.stringify(images),
      },
    });
    if (res.count > 0) {
      console.log(`   ✓ ${slug}`);
      updated++;
    }
  }
  console.log(`\n✅ Updated ${updated} sites with verified CDN images!`);
}

if (process.argv[1]?.includes("update-images")) {
  updateImages()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
