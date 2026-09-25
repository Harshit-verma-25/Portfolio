"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useUI } from "@/store/ui";
import { useHasFinePointer, usePrefersReducedMotion } from "@/hooks/use-media";

/** A soft follower cursor with contextual states. Only rendered on fine pointers. */
export function CustomCursor() {
  const fine = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const { cursor, cursorLabel } = useUI();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (!fine || reduced) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest("a, button, [role='button'], input, textarea, select, [data-cursor]");
      const state = useUI.getState();
      if (interactive?.getAttribute("data-cursor") === "view") return;
      if (interactive && state.cursor === "default") state.setCursor("hover");
      if (!interactive && state.cursor === "hover") state.setCursor("default");
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [fine, reduced, x, y]);

  if (!fine || reduced) return null;

  const size = cursor === "view" ? 88 : cursor === "hover" ? 44 : 12;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full mix-blend-difference"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{ width: size, height: size, backgroundColor: cursor === "view" ? "rgba(255,255,255,1)" : cursor === "hover" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <AnimatePresence>
        {cursor === "view" && (
          <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-[11px] font-semibold uppercase tracking-wider text-black">
            {cursorLabel ?? "View"}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
