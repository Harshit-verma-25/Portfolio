"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/admin/analytics";

// Single series → one validated hue (passes lightness band + 3:1 contrast on #050816).
const BAR = "#7C7FF5";

const fmtDay = (d: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

/** Daily bar chart: 4px rounded tops anchored to the baseline, 2px gaps, recessive grid, per-bar hover tooltip, table fallback. */
export function DailyChart({ data, label }: { data: DailyPoint[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const pad = { top: 12, right: 8, bottom: 26, left: 36 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = Math.ceil(max / 4) * 4 || 4;
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const slot = innerW / data.length;
  const barW = Math.max(2, slot - 2); // 2px surface gap between adjacent bars
  const y = (v: number) => pad.top + innerH - (v / niceMax) * innerH;
  const ticks = [0, niceMax / 2, niceMax];
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <figure>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${label}: ${total} over the last ${data.length} days. Table view follows.`} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
              <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className="fill-zinc-400 text-[10px]">
                {t}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = pad.left + i * slot + 1;
            const h = Math.max(0, pad.top + innerH - y(d.value));
            const r = Math.min(4, barW / 2, h);
            const top = pad.top + innerH - h;
            // Rounded data-end (top), square at the baseline.
            const path = h > 0 ? `M${x},${pad.top + innerH} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${pad.top + innerH} Z` : "";
            return (
              <g key={d.day}>
                {path && <path d={path} fill={BAR} opacity={hover === null || hover === i ? 1 : 0.45} />}
                {/* hit target: the full column, larger than the mark */}
                <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
              </g>
            );
          })}
          <line x1={pad.left} x2={W - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} stroke="rgba(255,255,255,0.15)" />
          {[0, Math.floor(data.length / 2), data.length - 1].map((i) =>
            data[i] ? (
              <text key={i} x={pad.left + i * slot + slot / 2} y={H - 6} textAnchor="middle" className="fill-zinc-400 text-[10px]">
                {fmtDay(data[i].day)}
              </text>
            ) : null,
          )}
        </svg>
        {hover !== null && data[hover] && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-line bg-bg-elevated px-3 py-2 text-xs shadow-xl"
            style={{ left: `${((pad.left + hover * slot + slot / 2) / W) * 100}%` }}
          >
            <p className="text-muted">{fmtDay(data[hover].day, { weekday: "short", month: "short", day: "numeric" })}</p>
            <p className="font-semibold text-fg">
              {data[hover].value.toLocaleString()} <span className="font-normal text-muted">{label.toLowerCase()}</span>
            </p>
          </div>
        )}
      </div>
      <details className="mt-3 text-xs text-muted">
        <summary className="cursor-pointer select-none hover:text-fg">Table view</summary>
        <table className="mt-2 w-full max-w-sm text-left">
          <thead>
            <tr>
              <th scope="col" className="py-1 font-medium">
                Day
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                {label}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.day} className="border-t border-line">
                <td className="py-1">{fmtDay(d.day)}</td>
                <td className="py-1 text-right font-mono text-zinc-300">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
