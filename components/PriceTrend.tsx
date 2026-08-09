import type { PriceSnapshot } from "@/lib/cms/types";
import { formatMoney } from "@/lib/cms/pricing";

export default function PriceTrend({
  history,
  currency = "MYR",
  labels,
}: {
  history: PriceSnapshot[];
  currency?: string;
  labels: {
    title: string;
    date: string;
    price: string;
    change: string;
  };
}) {
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
  const deltaPct =
    first.priceLow > 0
      ? ((latest.priceLow - first.priceLow) / first.priceLow) * 100
      : 0;

  // Show last 14 rows for readability (newest last)
  const rows = history.slice(-14);

  return (
    <div className="mt-6 border border-white/10 rounded-sm bg-ink-soft/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 text-[11px] tracking-wide-2 text-ivory/50 uppercase">
        <span>{labels.title}</span>
        <span className={deltaPct >= 0 ? "text-gold-soft" : "text-ivory/70"}>
          {deltaPct >= 0 ? "+" : ""}
          {deltaPct.toFixed(1)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[280px] h-16 mt-3 mx-4">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gold-soft"
          points={points}
        />
      </svg>

      <div className="mt-3 border-t border-white/10 overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="text-ivory/45 tracking-wide-2">
              <th className="px-4 py-2 font-normal">{labels.date}</th>
              <th className="px-4 py-2 font-normal">{labels.price}</th>
              <th className="px-4 py-2 font-normal text-right">{labels.change}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const prev = i === 0 ? rows[0] : rows[i - 1];
              // Compare to previous day in full history when possible
              const fullIdx = history.findIndex((h) => h.date === row.date);
              const prevFull = fullIdx > 0 ? history[fullIdx - 1] : null;
              const dayDelta = prevFull
                ? row.priceLow - prevFull.priceLow
                : i > 0
                  ? row.priceLow - prev.priceLow
                  : 0;
              const dayPct =
                prevFull && prevFull.priceLow > 0
                  ? (dayDelta / prevFull.priceLow) * 100
                  : 0;
              return (
                <tr key={row.date} className="border-t border-white/5 text-ivory/80">
                  <td className="px-4 py-2 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gold-soft">
                    {formatMoney(row.priceLow, currency)}
                  </td>
                  <td
                    className={`px-4 py-2 whitespace-nowrap text-right ${
                      dayDelta > 0
                        ? "text-gold-soft"
                        : dayDelta < 0
                          ? "text-ivory/50"
                          : "text-ivory/40"
                    }`}
                  >
                    {fullIdx === 0
                      ? "—"
                      : `${dayDelta >= 0 ? "+" : ""}${dayPct.toFixed(2)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
