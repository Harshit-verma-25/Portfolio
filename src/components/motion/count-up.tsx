"use client";

import { useEffect, useState } from "react";
import { useInViewOnce, usePrefersReducedMotion } from "@/hooks/use-media";

/** Counts from 0 to `value` with an ease-out curve the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, duration = 1400, suffix = "" }: { value: number; decimals?: number; duration?: number; suffix?: string }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>();
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) return setCurrent(value);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setCurrent(value * (1 - Math.pow(1 - t, 4)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden>
        {current.toFixed(decimals)}
        {suffix}
      </span>
      <span className="sr-only">
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}
