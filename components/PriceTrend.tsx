import type { PriceSnapshot } from "@/lib/cms/types";

export default function PriceTrend({
  history,
  labels,
  originalPrice,
  currentPrice,
}: {
  history: PriceSnapshot[];
  currency?: string;
  labels: {
    title: string;
    date?: string;
    price?: string;
    change?: string;
  };
  /** 原价 — used for % when history is short/flat */
  originalPrice?: number;
  /** 当前价 */
  currentPrice?: number;
}) {
  if (history.length < 2) return null;

  const lows = history.map((h) => h.priceLow);
  const min = Math.min(...lows);
  const max = Math.max(...lows);
  const range = max - min || 1;
  const w = 320;
  const h = 72;
  const points = history
    .map((snap, i) => {
      const x = (i / (history.length - 1)) * w;
      const y =
        max === min
          ? h / 2
          : h - ((snap.priceLow - min) / range) * (h - 12) - 6;
      return `${x},${y}`;
    })
    .join(" ");

  const latest = history[history.length - 1];
  const first = history[0];

  // Prefer 原价→当前价 for the badge (matches what users see above the chart)
  let deltaPct = 0;
  if (
    originalPrice != null &&
    originalPrice > 0 &&
    currentPrice != null &&
    currentPrice > 0
  ) {
    deltaPct = ((currentPrice - originalPrice) / originalPrice) * 100;
  } else if (first.priceLow > 0) {
    deltaPct = ((latest.priceLow - first.priceLow) / first.priceLow) * 100;
  }

  return (
    <div className="mt-6 border border-white/10 rounded-sm bg-ink-soft/20 px-4 py-4">
      <div className="flex items-center justify-between text-[11px] tracking-wide-2 text-ivory/50 uppercase">
        <span>{labels.title}</span>
        <span className={deltaPct >= 0 ? "text-gold-soft" : "text-ivory/70"}>
          {deltaPct >= 0 ? "+" : ""}
          {deltaPct.toFixed(1)}%
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-[320px] h-[72px] mt-3"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-gold-soft"
          points={points}
        />
      </svg>
    </div>
  );
}
