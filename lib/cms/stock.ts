import type { SpecRow } from "./types";

const STOCK_MARKER = "__stock";

/** Embed stock into specs so it persists even before DB column migration. */
export function withStockInSpecs(specs: SpecRow[], qty: number): SpecRow[] {
  const cleaned = specs.filter((s) => s.label?.cn !== STOCK_MARKER);
  const n = Math.max(0, Math.floor(Number(qty) || 0));
  return [
    ...cleaned,
    {
      label: { cn: STOCK_MARKER, zh: STOCK_MARKER, en: STOCK_MARKER },
      value: { cn: String(n), zh: String(n), en: String(n) },
    },
  ];
}

/** Read stock from column and/or specs meta; strip meta from public specs. */
export function readStockFromRow(
  specs: SpecRow[] | null | undefined,
  columnValue: unknown
): { stockQuantity: number; specs: SpecRow[] } {
  const list = Array.isArray(specs) ? specs : [];
  const meta = list.find((s) => s.label?.cn === STOCK_MARKER);
  const fromMeta = meta ? Number(meta.value?.cn) : NaN;
  const fromCol =
    columnValue != null && columnValue !== ""
      ? Number(columnValue)
      : NaN;
  const stockQuantity = Number.isFinite(fromCol)
    ? Math.max(0, Math.floor(fromCol))
    : Number.isFinite(fromMeta)
      ? Math.max(0, Math.floor(fromMeta))
      : 1;
  return {
    stockQuantity,
    specs: list.filter((s) => s.label?.cn !== STOCK_MARKER),
  };
}

/** Parse limited-edition count from titles like "限量，3000个". */
export function parseStockFromTitle(title: string): number | null {
  const m = title.match(/限量[，,\s]*(\d+)\s*个?/);
  if (!m) return null;
  return Math.max(0, Math.floor(Number(m[1])));
}
