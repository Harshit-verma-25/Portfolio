"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { AnalyticsProvider } from "./analytics-provider";
import { SmoothScroll } from "./smooth-scroll";

/**
 * LazyMotion + `m` components ship only the DOM animation features we use (no layout
 * projection or drag), and `strict` fails loudly if a full `motion` component sneaks in.
 */
export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <AnalyticsProvider>
          <SmoothScroll />
          {children}
        </AnalyticsProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
