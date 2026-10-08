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
  "Ancient City",
  "Stepwell",
  "Architecture",
  "Natural Heritage",
];

const KEY_BY_CATEGORY: Record<string, string> = {
  All: "categories.all",
  Monument: "categories.monument",
  Fort: "categories.fort",
  Palace: "categories.palace",
  "Ancient City": "categories.ancientCity",
  Stepwell: "categories.stepwell",
  Architecture: "categories.architecture",
  "Natural Heritage": "categories.naturalHeritage",
};

export function categoryLabelKey(category: string): string {
  return KEY_BY_CATEGORY[category] ?? category;
}
