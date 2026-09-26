"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

type Node = { id: string; label: string; group: string };

const GROUP_ORDER = ["input", "vision", "logic", "ai", "data", "output"];
const GROUP_COLORS: Record<string, string> = {
  input: "#06B6D4",
  vision: "#6366F1",
  logic: "#8B5CF6",
  ai: "#F472B6",
  data: "#22C55E",
  output: "#F59E0B",
};
const GROUP_NOTES: Record<string, string> = {
  input: "Raw signal enters the system — processed on-device for privacy and latency.",
  vision: "Computer-vision stage: landmarks and features extracted every frame.",
  logic: "Deterministic rules turn features into verified, explainable findings.",
  ai: "The LLM only rephrases verified findings into natural coaching cues.",
  data: "Compact summaries persisted for history and progress tracking.",
  output: "What the user sees and hears.",
};

/**
 * Interactive architecture diagram. Nodes are laid out in columns by pipeline stage; edges
 * follow the data flow. Hover, focus or tap a node to trace its connections.
 */
export function ArchitectureFlow({ nodes, accent }: { nodes: Node[]; accent: string }) {
  const [active, setActive] = useState<string | null>(null);
  const columns = GROUP_ORDER.filter((g) => nodes.some((n) => n.group === g));
  const W = 960;
  const H = 420;
  const colX = (g: string) => 90 + (columns.indexOf(g) / Math.max(1, columns.length - 1)) * (W - 180);
  const pos = new Map<string, { x: number; y: number }>();
  columns.forEach((g) => {
    const inCol = nodes.filter((n) => n.group === g);
    inCol.forEach((n, i) => pos.set(n.id, { x: colX(g), y: ((i + 1) / (inCol.length + 1)) * H }));
  });
  // Pipeline edges follow the node order; the data store also feeds the dashboard.
  const edges: [string, string][] = nodes.slice(1).map((n, i) => [nodes[i].id, n.id]);
  const dataNode = nodes.find((n) => n.group === "data");
  const lastOut = [...nodes].reverse().find((n) => n.group === "output");
  if (dataNode && lastOut && !edges.some(([a, b]) => a === dataNode.id && b === lastOut.id)) edges.push([dataNode.id, lastOut.id]);

  const connected = (id: string) => !active || id === active || edges.some(([a, b]) => (a === active && b === id) || (b === active && a === id));
  const activeNode = nodes.find((n) => n.id === active);

  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="overflow-x-auto" data-lenis-prevent>
        <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[720px]" role="group" aria-label="Interactive system architecture">
          <defs>
            <linearGradient id="edge" x1="0" x2="1">
              <stop offset="0" stopColor={accent} stopOpacity="0.2" />
              <stop offset="1" stopColor="#06B6D4" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {columns.map((g) => (
            <text key={g} x={colX(g)} y={24} textAnchor="middle" className="fill-zinc-400 font-mono text-[11px] uppercase tracking-widest">
              {g}
            </text>
          ))}
          {edges.map(([a, b]) => {
            const p1 = pos.get(a)!;
            const p2 = pos.get(b)!;
            const mx = (p1.x + p2.x) / 2;
            const d = `M ${p1.x} ${p1.y} C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}`;
            const lit = !active || a === active || b === active;
            return (
              <g key={`${a}-${b}`} opacity={lit ? 1 : 0.15} className="transition-opacity duration-300">
                <path d={d} fill="none" stroke="url(#edge)" strokeWidth={2} />
                <m.path d={d} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="4 16" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -200 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
              </g>
            );
          })}
          {nodes.map((n) => {
            const p = pos.get(n.id)!;
            const color = GROUP_COLORS[n.group] ?? accent;
            return (
              <g
                key={n.id}
                transform={`translate(${p.x}, ${p.y})`}
                tabIndex={0}
                role="button"
                aria-pressed={active === n.id}
                aria-label={`${n.label} (${n.group})`}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === n.id ? null : n.id)}
                className={cn("cursor-pointer outline-none transition-opacity duration-300", !connected(n.id) && "opacity-30")}
              >
                <rect x={-78} y={-22} width={156} height={44} rx={22} fill="#0b1024" stroke={color} strokeWidth={active === n.id ? 2.5 : 1.2} />
                <circle cx={-58} cy={0} r={5} fill={color} />
                <text x={6} y={5} textAnchor="middle" className="fill-zinc-100 text-[13px] font-medium">
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="min-h-[76px] border-t border-line px-6 py-4 text-sm" aria-live="polite">
        {activeNode ? (
          <p>
            <span className="font-semibold" style={{ color: GROUP_COLORS[activeNode.group] }}>
              {activeNode.label}
            </span>{" "}
            <span className="text-muted">— {GROUP_NOTES[activeNode.group] ?? "Part of the pipeline."}</span>
          </p>
        ) : (
          <p className="text-muted">Hover, focus or tap a node to trace how data flows through the system.</p>
        )}
      </div>
    </div>
  );
}
