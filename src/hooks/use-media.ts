"use client";

import { useEffect, useRef, useState } from "react";

export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** True once the element has scrolled into view (one-shot). */
export function useInViewOnce<T extends Element>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);
  return [ref, inView] as const;
}
