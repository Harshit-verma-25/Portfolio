"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/** Lenis smooth scrolling for wheel input. Disabled under reduced motion and on touch (native scroll is better there). */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, autoRaf: true });
    lenisInstance = lenis;
    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) lenisInstance?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
