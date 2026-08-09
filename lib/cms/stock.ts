import type { SpecRow } from "./types";

const STOCK_MARKER = "__stock";
const PRICE_MARKER = "__price";
const TRAIL_MARKER = "__trail";

export type PriceTrailPoint = { date: string; price: number };

function stripMarker(specs: SpecRow[], marker: string): SpecRow[] {
  return (Array.isArray(specs) ? specs : []).filter(
    (s) => s.label?.cn !== marker
  );
}

export function stripProductMeta(specs: SpecRow[]): SpecRow[] {
  return stripMarker(
    stripMarker(stripMarker(specs, STOCK_MARKER), PRICE_MARKER),
    TRAIL_MARKER
  );
}

function upsertMeta(
  specs: SpecRow[],
  marker: string,
  value: string
): SpecRow[] {
  return [
    ...stripMarker(specs, marker),
    {
      label: { cn: marker, zh: marker, en: marker },
      value: { cn: value, zh: value, en: value },
    },
  ];
}

function readMeta(
  specs: SpecRow[] | null | undefined,
  marker: string
): string | null {
  const list = Array.isArray(specs) ? specs : [];
  const meta = list.find((s) => s.label?.cn === marker);
  if (!meta) return null;
  const v = meta.value?.cn;
  return v == null || v === "" ? null : String(v);
}

export function parsePriceTrail(raw: string | null | undefined): PriceTrailPoint[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => ({
        date: String((p as PriceTrailPoint).date || "").slice(0, 10),
        price: Number((p as PriceTrailPoint).price),
      }))
      .filter((p) => p.date && Number.isFinite(p.price) && p.price > 0)
      .slice(-24);
  } catch {
    return [];
  }
}

/** Append a waypoint when admin changes current price (keeps multi-edit shape). */
export function appendPriceTrail(
  trail: PriceTrailPoint[],
  price: number,
  date = new Date().toISOString().slice(0, 10)
): PriceTrailPoint[] {
  if (!Number.isFinite(price) || price <= 0) return trail;
  const next = [...trail];
  const last = next[next.length - 1];
  if (last && last.date === date && Math.abs(last.price - price) < 0.5) {
    return next;
  }
  // Same-day re-edit: replace last point so the curve gains a new peak level
  if (last && last.date === date) {
    next[next.length - 1] = { date, price };
  } else {
    next.push({ date, price });
  }
  return next.slice(-24);
}

/** Embed stock + manual current price + price trail into specs. */
export function withProductMetaInSpecs(
  specs: SpecRow[],
  stock: number,
  manualCurrentPrice: number | null,
  priceTrail: PriceTrailPoint[] = []
): SpecRow[] {
  let next = upsertMeta(
    Array.isArray(specs) ? specs : [],
    STOCK_MARKER,
    String(Math.max(0, Math.floor(Number(stock) || 0)))
  );
  if (manualCurrentPrice != null && manualCurrentPrice > 0) {
    next = upsertMeta(next, PRICE_MARKER, String(manualCurrentPrice));
  } else {
    next = stripMarker(next, PRICE_MARKER);
  }
  if (priceTrail.length) {
    next = upsertMeta(next, TRAIL_MARKER, JSON.stringify(priceTrail));
  } else {
    next = stripMarker(next, TRAIL_MARKER);
  }
  return next;
}

/** @deprecated use withProductMetaInSpecs */
export function withStockInSpecs(specs: SpecRow[], qty: number): SpecRow[] {
  return withProductMetaInSpecs(specs, qty, null, []);
}

export function readProductMetaFromRow(
  specs: SpecRow[] | null | undefined,
  columnStock: unknown
): {
  stockQuantity: number;
  manualCurrentPrice: number | null;
  priceTrail: PriceTrailPoint[];
  specs: SpecRow[];
} {
  const list = Array.isArray(specs) ? specs : [];
  const stockMeta = readMeta(list, STOCK_MARKER);
  const priceMeta = readMeta(list, PRICE_MARKER);
  const trailMeta = readMeta(list, TRAIL_MARKER);

  const fromCol =
    columnStock != null && columnStock !== ""
      ? Number(columnStock)
      : NaN;
  const fromMeta = stockMeta != null ? Number(stockMeta) : NaN;

  let stockQuantity = 0;
  if (stockMeta != null && Number.isFinite(fromMeta)) {
    stockQuantity = Math.max(0, Math.floor(fromMeta));
  } else if (Number.isFinite(fromCol)) {
    stockQuantity = Math.max(0, Math.floor(fromCol));
  }

  const manualRaw = priceMeta != null ? Number(priceMeta) : NaN;
  const manualCurrentPrice =
    Number.isFinite(manualRaw) && manualRaw > 0 ? manualRaw : null;

  return {
    stockQuantity,
    manualCurrentPrice,
    priceTrail: parsePriceTrail(trailMeta),
    specs: stripProductMeta(list),
  };
}

/** @deprecated use readProductMetaFromRow */
export function readStockFromRow(
  specs: SpecRow[] | null | undefined,
  columnValue: unknown
): { stockQuantity: number; specs: SpecRow[] } {
  const r = readProductMetaFromRow(specs, columnValue);
  return { stockQuantity: r.stockQuantity, specs: r.specs };
}

export function parseStockFormValue(raw: FormDataEntryValue | null): number {
  if (raw == null) return 0;
  const s = String(raw).trim();
  if (s === "") return 0;
  const n = Number(s);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}
