import type { PriceSnapshot } from "@/lib/cms/types";
import { formatMoney } from "@/lib/cms/pricing";
import type { Locale } from "@/lib/i18n";

/** Build a smooth cubic path through points (Catmull-Rom → Bezier). */
function smoothPath(
  pts: { x: number; y: number }[],
  tension = 0.2
): string {
  if (pts.length < 2) return "";
  if (pts.length === 2) {
    return `M ${pts[0]!.x} ${pts[0]!.y} L ${pts[1]!.x} ${pts[1]!.y}`;
  }
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 2;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 2;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 2;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 2;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

export default function PriceTrend({
  history,
  currency = "MYR",
  lang = "cn",
  labels,
  originalPrice,
  currentPrice,
}: {
  history: PriceSnapshot[];
  currency?: string;
  lang?: Locale;
  labels: {
    title: string;
    date?: string;
    price?: string;
    change?: string;
    original?: string;
  };
  originalPrice?: number;
  currentPrice?: number;
}) {
  if (history.length < 2) return null;

  const currentCheck = currentPrice ?? history[history.length - 1]?.priceLow ?? 0;
  // Coming soon (price 0 / empty): hide historical price nodes
  if (!(currentCheck > 0)) return null;

  const prices = history.map((h) => h.priceLow);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.08 || max * 0.02 || 1;
  const yMin = Math.max(0, min - pad);
  const yMax = max + pad;
  const yRange = yMax - yMin || 1;

  // Chart geometry (viewBox units)
  const W = 560;
  const H = 200;
  const padL = 56;
  const padR = 16;
  const padT = 18;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const pts = history.map((snap, i) => {
    const x = padL + (i / (history.length - 1)) * plotW;
    const y = padT + (1 - (snap.priceLow - yMin) / yRange) * plotH;
    return { x, y, price: snap.priceLow, date: snap.date };
  });

  const linePath = smoothPath(pts);
  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const areaPath = `${linePath} L ${last.x} ${padT + plotH} L ${first.x} ${padT + plotH} Z`;

  const origin = originalPrice ?? first.price;
  const current = currentPrice ?? last.price;
  const deltaPct =
    origin > 0 ? ((current - origin) / origin) * 100 : 0;
  const gain = current - origin;

  // Y-axis ticks (3)
  const ticks = [0, 0.5, 1].map((t) => {
    const value = yMin + (1 - t) * (yMax - yMin);
    // remap: t=0 top → value=yMax; we want labels at top/mid/bottom
    return value;
  });
  // clearer: top = yMax, mid, bottom = yMin
  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  const gridYs = yTicks.map(
    (v) => padT + (1 - (v - yMin) / yRange) * plotH
  );

  const uid = `pt-${history[0]!.date}-${history[history.length - 1]!.date}`;

  return (
    <div className="mt-6 overflow-hidden rounded-sm border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
      <div className="flex items-end justify-between gap-4 px-4 pt-4">
        <div>
          <div className="text-[11px] tracking-wide-2 text-ivory/45 uppercase">
            {labels.title}
          </div>
          <div className="mt-1 font-display text-lg text-gold-soft tabular-nums">
            {formatMoney(current, currency, lang)}
          </div>
          {current > 0 && origin > 0 ? (
            <div className="mt-0.5 text-[11px] text-ivory/40">
              {gain >= 0 ? "+" : ""}
              {formatMoney(Math.abs(gain), currency, lang)}
              <span className="text-ivory/30">
                {" "}
                / {labels.original || labels.price || "—"}
              </span>
            </div>
          ) : null}
        </div>
        <div
          className={`shrink-0 rounded-sm border px-2.5 py-1 text-[12px] font-medium tabular-nums ${
            deltaPct >= 0
              ? "border-gold-soft/40 bg-gold-soft/10 text-gold-soft"
              : "border-white/15 text-ivory/60"
          }`}
        >
          {deltaPct >= 0 ? "+" : ""}
          {deltaPct.toFixed(1)}%
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full"
        role="img"
        aria-label={labels.title}
      >
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4a66a" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#c4a66a" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#c4a66a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a6f38" />
            <stop offset="50%" stopColor="#c4a66a" />
            <stop offset="100%" stopColor="#e8d5a3" />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {gridYs.map((gy, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={padL + plotW}
              y1={gy}
              y2={gy}
              stroke="rgba(247,243,234,0.08)"
              strokeDasharray={i === 1 ? "0" : "3 4"}
            />
            <text
              x={padL - 8}
              y={gy + 3}
              textAnchor="end"
              fill="rgba(247,243,234,0.38)"
              fontSize="10"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {Math.round(yTicks[i]!).toLocaleString("en-MY")}
            </text>
          </g>
        ))}

        {/* Area + line */}
        <path d={areaPath} fill={`url(#${uid}-fill)`} />
        <path
          d={linePath}
          fill="none"
          stroke={`url(#${uid}-stroke)`}
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={`url(#${uid}-glow)`}
        />

        {/* Endpoint */}
        <circle
          cx={last.x}
          cy={last.y}
          r="5"
          fill="#16120f"
          stroke="#e8d5a3"
          strokeWidth="2"
        />
        <circle cx={last.x} cy={last.y} r="2" fill="#c4a66a" />

        {/* X labels */}
        <text
          x={first.x}
          y={H - 8}
          textAnchor="start"
          fill="rgba(247,243,234,0.38)"
          fontSize="10"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {shortDate(history[0]!.date)}
        </text>
        <text
          x={last.x}
          y={H - 8}
          textAnchor="end"
          fill="rgba(247,243,234,0.38)"
          fontSize="10"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {shortDate(history[history.length - 1]!.date)}
        </text>
      </svg>
    </div>
  );
}
