"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Apple-style product card: 3D tilt toward the pointer, a moving specular reflection and a
 * dynamic light that follows the cursor. Falls back to a flat card on touch devices.
 */
export function TiltCard({ children, className, accent = "#6366F1", max = 10 }: { children: React.ReactNode; className?: string; accent?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const lightX = useTransform(px, (v) => `${v * 100}%`);
  const lightY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(600px circle at ${lightX} ${lightY}, ${accent}33, transparent 45%)`;
  const reflection = useMotionTemplate`linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.12) ${lightX}, transparent 70%)`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn("group relative overflow-hidden rounded-3xl border border-line bg-white/[0.04] transition-shadow duration-500 hover:shadow-[0_30px_80px_-20px_rgba(99,102,241,0.45)]", className)}
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: glare }} />
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" style={{ background: reflection }} />
        {children}
      </motion.div>
    </div>
  );
}
