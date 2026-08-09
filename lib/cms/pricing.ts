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

/** Price seed used for uplift: manual current price, else original (baseLow). */
export function priceSeed(
  product: Pick<ProductRecord, "basePriceLow" | "basePriceHigh" | "manualCurrentPrice">
): number {
  if (product.manualCurrentPrice != null && product.manualCurrentPrice > 0) {
    return product.manualCurrentPrice;
  }
  return product.basePriceLow > 0 ? product.basePriceLow : product.basePriceHigh;
}

export function originalPrice(
  product: Pick<ProductRecord, "basePriceLow" | "basePriceHigh">
): number {
  return product.basePriceLow > 0 ? product.basePriceLow : product.basePriceHigh;
}

/** Single-price uplift from the seed price. */
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
  const seed = priceSeed(product);
  const current = computeCurrentPrice(
    seed,
    uplift,
    now,
    product.priceCapHigh
  );
  const currency = product.currency || rules.currency;
  return {
    ...product,
    stockQuantity: Number(product.stockQuantity ?? 0),
    manualCurrentPrice:
      product.manualCurrentPrice != null && product.manualCurrentPrice > 0
        ? product.manualCurrentPrice
        : null,
    displayPriceLow: current,
    displayPriceHigh: current,
    estimate: formatMoney(current, currency),
  };
}

/**
 * Build a climbing price series from 原价 → 当前价.
 * Uses daily uplift shape when possible; always ends at the live display price
 * so the chart stays in sync with the strikethrough / current price UI.
 */
export function buildPriceHistory(
  product: Pick<
    ProductRecord,
    | "basePriceLow"
    | "basePriceHigh"
    | "manualCurrentPrice"
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
  const origin = originalPrice(product);
  const today = new Date();
  const current = computeCurrentPrice(
    priceSeed(product),
    uplift,
    today,
    product.priceCapHigh
  );
  const startKey = (uplift.startAt || today.toISOString()).slice(0, 10);
  const totalClimbDays = Math.max(1, daysSince(startKey, today));

  const out: PriceSnapshot[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);

    let price: number;
    if (origin <= 0) {
      price = current;
    } else if (date < startKey) {
      // Before uplift start: flat at original
      price = origin;
    } else if (!uplift.enabled || current <= origin) {
      // No uplift / no gain yet: step up to current on/after start
      price = date >= startKey ? current : origin;
    } else {
      // Climb from original → current across days since uplift start
      const elapsed = daysSince(startKey, d);
      const t = Math.min(1, elapsed / totalClimbDays);

      // Prefer real daily-uplift shape from original, scaled to hit `current` today
      const raw = computeCurrentPrice(origin, uplift, d, product.priceCapHigh);
      const rawToday = computeCurrentPrice(
        origin,
        uplift,
        today,
        product.priceCapHigh
      );

      if (rawToday > origin + 0.01) {
        const progress = (raw - origin) / (rawToday - origin);
        price = origin + (current - origin) * Math.min(1, Math.max(0, progress));
      } else {
        // Uplift from original is still flat (e.g. seed is manual) — linear climb
        price = origin + (current - origin) * t;
      }
    }

    out.push({
      date,
      priceLow: roundMoney(price),
      priceHigh: roundMoney(price),
    });
  }

  // Hard-align last point with live current price
  if (out.length && current > 0) {
    out[out.length - 1] = {
      ...out[out.length - 1],
      priceLow: roundMoney(current),
      priceHigh: roundMoney(current),
    };
  }

  return out;
}
