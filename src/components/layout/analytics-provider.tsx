"use client";

import { Suspense, useEffect } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!KEY || !pathname) return;
    const qs = searchParams?.toString();
    posthog.capture("$pageview", { $current_url: window.location.origin + pathname + (qs ? `?${qs}` : "") });
  }, [pathname, searchParams]);
  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || posthog.__loaded) return;
    posthog.init(KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
      ui_host: "https://us.posthog.com",
      capture_pageview: false, // captured manually on route change
      capture_pageleave: true,
      person_profiles: "identified_only",
      respect_dnt: true,
    });
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  );
}
