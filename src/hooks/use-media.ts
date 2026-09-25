"use client";

import { useEffect, useState } from "react";

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
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useHasFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");

export type DeviceTier = "low" | "mid" | "high";

/** Rough GPU/CPU tier used to scale particle counts, DPR and post effects. */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("mid");
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (cores <= 4 || memory <= 2) setTier("low");
    else if (mobile || cores <= 8) setTier("mid");
    else setTier("high");
  }, []);
  return tier;
}
