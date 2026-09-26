"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Glass card with a glow that follows the pointer, plus hover elevation. The pointer position
 * is written to CSS custom properties, so there is no React re-render and no animation library.
 */
export function SpotlightCard({ children, className, glow = "#6366F1" }: { children: React.ReactNode; className?: string; glow?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      style={{ "--glow": glow } as React.CSSProperties}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-line bg-white/[0.03] backdrop-blur-sm",
        "transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)]",
        "hover:-translate-y-1.5 hover:scale-[1.01] hover:border-white/15 hover:shadow-[0_24px_60px_-24px_var(--glow)]",
        "motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100",
        className,
      )}
    >
      {/* Pointer-follow glow (fill) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--glow) 18%, transparent), transparent 60%)" }}
      />
      {/* Pointer-follow glow (border) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          padding: 1,
          background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--glow) 80%, white), transparent 70%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {children}
    </div>
  );
}
