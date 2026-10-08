export interface PricingData {
  entryFees: { siteId: string; siteName: string; indianInr: number; foreignInr: number }[];
  guideRates: { tier: string; priceInr: number }[];
  feeBreakdownNote: string;
  /** Non-English variants of `feeBreakdownNote`/`guideRates[].tier`, keyed by language code. */
  translations?: Partial<Record<"hi" | "es", { feeBreakdownNote?: string; guideRateTiers?: string[] }>>;
}
