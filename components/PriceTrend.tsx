import type { PriceSnapshot } from "@/lib/cms/types";

export default function PriceTrend({ history }: { history: PriceSnapshot[] }) {
  if (history.length < 2) return null;

  const lows = history.map((h) => h.priceLow);
  const min = Math.min(...lows);
  const max = Math.max(...lows);
  const range = max - min || 1;
  const w = 280;
  const h = 64;
  const points = history
    .map((snap, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - ((snap.priceLow - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  const latest = history[history.length - 1];
  const first = history[0];
  const delta = first.priceLow > 0 ? ((latest.priceLow - first.priceLow) / first.priceLow) * 100 : 0;

  return (
    <div className="mt-6 p-4 border border-white/10 rounded-sm bg-ink-soft/20">
      <div className="flex items-center justify-between text-[11px] tracking-wide-2 text-ivory/50 uppercase">
        <span>30-day estimate trend</span>
        <span className={delta >= 0 ? "text-gold-soft" : "text-ivory/70"}>
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(1)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[280px] h-16 mt-3">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gold-soft"
          points={points}
        />
      </svg>
      <p className="text-[10px] text-ivory/40 mt-2">
        RM {Math.round(latest.priceLow).toLocaleString()} – {Math.round(latest.priceHigh).toLocaleString()} today
      </p>
    </div>
  );
}
