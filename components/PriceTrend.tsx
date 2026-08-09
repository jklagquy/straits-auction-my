import type { PriceSnapshot } from "@/lib/cms/types";

export default function PriceTrend({
  history,
  labels,
}: {
  history: PriceSnapshot[];
  currency?: string;
  labels: {
    title: string;
    date?: string;
    price?: string;
    change?: string;
  };
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
          : h - ((snap.priceLow - min) / range) * (h - 10) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  const latest = history[history.length - 1];
  const first = history[0];
  const deltaPct =
    first.priceLow > 0
      ? ((latest.priceLow - first.priceLow) / first.priceLow) * 100
      : 0;

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
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-gold-soft"
          points={points}
        />
      </svg>
    </div>
  );
}
