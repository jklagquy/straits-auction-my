import type { PriceRules, PriceSnapshot, ProductRecord, UpliftMode } from "./types";

export function daysSince(startIso: string, now = new Date()): number {
  const start = new Date(startIso.slice(0, 10) + "T00:00:00");
  const today = new Date(now.toISOString().slice(0, 10) + "T00:00:00");
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
}

export function resolveUplift(
  product: Pick<
    ProductRecord,
    "upliftEnabled" | "upliftMode" | "upliftValue" | "upliftStartAt"
  >,
  rules: PriceRules
): { enabled: boolean; mode: UpliftMode; value: number; startAt: string } {
  const enabled =
    product.upliftEnabled ?? rules.defaultUpliftEnabled;
  const mode = product.upliftMode ?? rules.defaultUpliftMode;
  const value = product.upliftValue ?? rules.defaultUpliftValue;
  return { enabled, mode, value, startAt: product.upliftStartAt };
}

/** Single-price uplift from the original/base price (baseLow). */
export function computeCurrentPrice(
  base: number,
  uplift: ReturnType<typeof resolveUplift>,
  now = new Date(),
  capHigh: number | null = null
): number {
  if (!uplift.enabled || base <= 0) return roundMoney(base);
  const days = daysSince(uplift.startAt, now);
  let current =
    uplift.mode === "percent_daily"
      ? base * (1 + (uplift.value / 100) * days)
      : base + uplift.value * days;
  if (capHigh != null && capHigh > 0 && current > capHigh) current = capHigh;
  return roundMoney(current);
}

/** @deprecated Prefer computeCurrentPrice — kept for callers still passing a range. */
export function computeDisplayPrices(
  baseLow: number,
  baseHigh: number,
  uplift: ReturnType<typeof resolveUplift>,
  now = new Date(),
  capHigh: number | null = null
): { low: number; high: number } {
  const base = baseLow > 0 ? baseLow : baseHigh;
  const current = computeCurrentPrice(base, uplift, now, capHigh);
  return { low: current, high: current };
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatMoney(amount: number, currency = "MYR"): string {
  if (amount <= 0) return "Price on request";
  const sym = currency === "MYR" ? "RM" : currency;
  return `${sym} ${amount.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
}

export function formatEstimate(
  low: number,
  high: number,
  currency = "MYR"
): string {
  const amount = low > 0 ? low : high;
  return formatMoney(amount, currency);
}

export function enrichProduct<T extends Omit<ProductRecord, "displayPriceLow" | "displayPriceHigh" | "estimate">>(
  product: T,
  rules: PriceRules,
  now = new Date()
): ProductRecord {
  const uplift = resolveUplift(product, rules);
  const base = product.basePriceLow > 0 ? product.basePriceLow : product.basePriceHigh;
  const current = computeCurrentPrice(
    base,
    uplift,
    now,
    product.priceCapHigh
  );
  const currency = product.currency || rules.currency;
  return {
    ...product,
    stockQuantity: Number(product.stockQuantity ?? 1),
    displayPriceLow: current,
    displayPriceHigh: current,
    estimate: formatMoney(current, currency),
  };
}

export function buildPriceHistory(
  product: Pick<
    ProductRecord,
    | "basePriceLow"
    | "basePriceHigh"
    | "upliftEnabled"
    | "upliftMode"
    | "upliftValue"
    | "upliftStartAt"
    | "priceCapHigh"
  >,
  rules: PriceRules,
  days = 30
): PriceSnapshot[] {
  const uplift = resolveUplift(product, rules);
  const base = product.basePriceLow > 0 ? product.basePriceLow : product.basePriceHigh;
  const out: PriceSnapshot[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const price = computeCurrentPrice(base, uplift, d, product.priceCapHigh);
    out.push({
      date: d.toISOString().slice(0, 10),
      priceLow: price,
      priceHigh: price,
    });
  }
  return out;
}
