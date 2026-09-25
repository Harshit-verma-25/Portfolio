"use client";

import { MotionConfig } from "framer-motion";
import { AnalyticsProvider } from "./analytics-provider";
import { SmoothScroll } from "./smooth-scroll";

export function SiteProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AnalyticsProvider>
        <SmoothScroll />
        {children}
      </AnalyticsProvider>
    </MotionConfig>
  );
}
