import type { SpecRow } from "./types";

const STOCK_MARKER = "__stock";
const PRICE_MARKER = "__price";

function stripMarker(specs: SpecRow[], marker: string): SpecRow[] {
  return (Array.isArray(specs) ? specs : []).filter(
    (s) => s.label?.cn !== marker
  );
}

export function stripProductMeta(specs: SpecRow[]): SpecRow[] {
  return stripMarker(stripMarker(specs, STOCK_MARKER), PRICE_MARKER);
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

/** Embed stock + optional manual current price into specs for persistence. */
export function withProductMetaInSpecs(
  specs: SpecRow[],
  stock: number,
  manualCurrentPrice: number | null
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
  return next;
}

/** @deprecated use withProductMetaInSpecs */
export function withStockInSpecs(specs: SpecRow[], qty: number): SpecRow[] {
  return withProductMetaInSpecs(specs, qty, null);
}

export function readProductMetaFromRow(
  specs: SpecRow[] | null | undefined,
  columnStock: unknown
): {
  stockQuantity: number;
  manualCurrentPrice: number | null;
  specs: SpecRow[];
} {
  const list = Array.isArray(specs) ? specs : [];
  const stockMeta = readMeta(list, STOCK_MARKER);
  const priceMeta = readMeta(list, PRICE_MARKER);

  const fromCol =
    columnStock != null && columnStock !== ""
      ? Number(columnStock)
      : NaN;
  const fromMeta = stockMeta != null ? Number(stockMeta) : NaN;

  // Prefer specs meta (admin writes here) over DB column — column may be stuck at default 1
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
