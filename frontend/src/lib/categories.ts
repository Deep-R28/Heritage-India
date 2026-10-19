/**
 * Site categories stay canonical English values everywhere in filter/state
 * logic (matches the `category` field in nearby-sites.json) — only the
 * *display* label is translated via categoryLabelKey().
 */
export const CATEGORIES = [
  "All",
  "Monument",
  "Fort",
  "Palace",
  "Temple",
  "Ancient City",
  "Caves",
  "Gurudwara",
  "Memorial",
  "Religious Site",
  "Temple/Ruins",
  "Museum",
  "Bridge",
  "National Park",
  "Beach",
  "Natural Landscape",
  "Ruins",
  "Monastery",
  "Natural Wonder",
  "Stepwell",
  "Architecture",
  "Natural Heritage",
];

const KEY_BY_CATEGORY: Record<string, string> = {
  All: "categories.all",
  Monument: "categories.monument",
  Fort: "categories.fort",
  Palace: "categories.palace",
  Temple: "categories.temple",
  "Ancient City": "categories.ancientCity",
  Caves: "categories.caves",
  Gurudwara: "categories.gurudwara",
  Memorial: "categories.memorial",
  "Religious Site": "categories.religiousSite",
  "Temple/Ruins": "categories.templeRuins",
  Museum: "categories.museum",
  Bridge: "categories.bridge",
  "National Park": "categories.nationalPark",
  Beach: "categories.beach",
  "Natural Landscape": "categories.naturalLandscape",
  Ruins: "categories.ruins",
  Monastery: "categories.monastery",
  "Natural Wonder": "categories.naturalWonder",
  Stepwell: "categories.stepwell",
  Architecture: "categories.architecture",
  "Natural Heritage": "categories.naturalHeritage",
};

export function categoryLabelKey(category: string): string {
  return KEY_BY_CATEGORY[category] ?? category;
}
