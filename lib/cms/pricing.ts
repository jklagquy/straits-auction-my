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

export function computeDisplayPrices(
  baseLow: number,
  baseHigh: number,
  uplift: ReturnType<typeof resolveUplift>,
  now = new Date(),
  capHigh: number | null = null
): { low: number; high: number } {
  if (!uplift.enabled || baseLow <= 0) {
    return { low: baseLow, high: baseHigh };
  }
  const days = daysSince(uplift.startAt, now);
  let low = baseLow;
  let high = baseHigh;

  if (uplift.mode === "percent_daily") {
    const factor = 1 + (uplift.value / 100) * days;
    low = baseLow * factor;
    high = baseHigh * factor;
  } else {
    low = baseLow + uplift.value * days;
    high = baseHigh + uplift.value * days;
  }

  if (capHigh != null && capHigh > 0 && high > capHigh) {
    const ratio = baseHigh > 0 ? capHigh / high : 1;
    high = capHigh;
    low = low * ratio;
  }

  return { low: roundMoney(low), high: roundMoney(high) };
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatEstimate(
  low: number,
  high: number,
  currency = "MYR"
): string {
  if (low <= 0 && high <= 0) return "Price on request";
  const sym = currency === "MYR" ? "RM" : currency;
  const fmt = (n: number) =>
    n.toLocaleString("en-MY", { maximumFractionDigits: 0 });
  if (low === high) return `${sym} ${fmt(low)}`;
  return `${sym} ${fmt(low)} – ${fmt(high)}`;
}

export function enrichProduct<T extends Omit<ProductRecord, "displayPriceLow" | "displayPriceHigh" | "estimate">>(
  product: T,
  rules: PriceRules,
  now = new Date()
): ProductRecord {
  const uplift = resolveUplift(product, rules);
  const { low, high } = computeDisplayPrices(
    product.basePriceLow,
    product.basePriceHigh,
    uplift,
    now,
    product.priceCapHigh
  );
  return {
    ...product,
    displayPriceLow: low,
    displayPriceHigh: high,
    estimate: formatEstimate(low, high, product.currency || rules.currency),
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
  const out: { date: string; priceLow: number; priceHigh: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const { low, high } = computeDisplayPrices(
      product.basePriceLow,
      product.basePriceHigh,
      uplift,
      d,
      product.priceCapHigh
    );
    out.push({
      date: d.toISOString().slice(0, 10),
      priceLow: low,
      priceHigh: high,
    });
  }
  return out;
}
