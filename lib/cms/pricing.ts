import type { PriceRules, PriceSnapshot, ProductRecord, UpliftMode } from "./types";
import type { PriceTrailPoint } from "./stock";
import type { Locale } from "@/lib/i18n";

/** Shown when price is 0 / empty (not “询价”). */
export const COMING_SOON: Record<Locale, string> = {
  cn: "即将推出",
  zh: "即將推出",
  en: "Coming soon",
};

export function comingSoonLabel(lang: Locale = "cn"): string {
  return COMING_SOON[lang] || COMING_SOON.cn;
}

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

/** @deprecated Prefer computeCurrentPrice */
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

export function formatMoney(
  amount: number,
  currency = "MYR",
  lang: Locale = "cn"
): string {
  if (!Number.isFinite(amount) || amount <= 0) return comingSoonLabel(lang);
  const sym = currency === "MYR" ? "RM" : currency;
  return `${sym} ${amount.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
}

export function formatEstimate(
  low: number,
  high: number,
  currency = "MYR",
  lang: Locale = "cn"
): string {
  const amount = low > 0 ? low : high;
  return formatMoney(amount, currency, lang);
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
    priceTrail: Array.isArray(product.priceTrail) ? product.priceTrail : [],
    displayPriceLow: current,
    displayPriceHigh: current,
    estimate: formatMoney(current, currency, "cn"),
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Build a smooth climbing series from 原价 → waypoints → 当前价.
 * Admin price edits become visible steps/ramps (not a single identical step shape).
 */
export function buildPriceHistory(
  product: Pick<
    ProductRecord,
    | "basePriceLow"
    | "basePriceHigh"
    | "manualCurrentPrice"
    | "priceTrail"
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
  const todayKey = today.toISOString().slice(0, 10);
  const current = computeCurrentPrice(
    priceSeed(product),
    uplift,
    today,
    product.priceCapHigh
  );
  const startKey = (uplift.startAt || todayKey).slice(0, 10);

  // Waypoints: original at start → admin trail → live current today
  const trail = (product.priceTrail || []) as PriceTrailPoint[];
  const waypoints: PriceTrailPoint[] = [
    { date: startKey, price: origin > 0 ? origin : current },
    ...trail.filter((p) => p.date >= startKey && p.price > 0),
    { date: todayKey, price: current > 0 ? current : origin },
  ]
    // Sort + collapse same-day keeping the latest price
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce<PriceTrailPoint[]>((acc, p) => {
      const last = acc[acc.length - 1];
      if (last && last.date === p.date) {
        acc[acc.length - 1] = p;
      } else {
        acc.push(p);
      }
      return acc;
    }, []);

  // Ensure first price is original when available
  if (waypoints.length && origin > 0) {
    waypoints[0] = { ...waypoints[0], price: origin };
  }

  const out: PriceSnapshot[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);

    let price: number;
    if (date < waypoints[0]?.date) {
      price = origin > 0 ? origin : current;
    } else {
      // Find surrounding waypoints and ease between them
      let left = waypoints[0];
      let right = waypoints[waypoints.length - 1];
      for (let w = 0; w < waypoints.length; w++) {
        const pt = waypoints[w]!;
        if (pt.date <= date) left = pt;
        if (pt.date >= date) {
          right = pt;
          break;
        }
      }
      if (left.date === right.date) {
        price = right.price;
      } else {
        const span = Math.max(
          1,
          daysSince(left.date, new Date(right.date + "T00:00:00"))
        );
        const elapsed = daysSince(left.date, d);
        const t = easeInOutCubic(Math.min(1, Math.max(0, elapsed / span)));
        price = lerp(left.price, right.price, t);
      }
    }

    out.push({
      date,
      priceLow: roundMoney(price),
      priceHigh: roundMoney(price),
    });
  }

  if (out.length && current > 0) {
    out[out.length - 1] = {
      ...out[out.length - 1]!,
      priceLow: roundMoney(current),
      priceHigh: roundMoney(current),
    };
  }

  return out;
}
