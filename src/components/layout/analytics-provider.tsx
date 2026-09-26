"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    // Defer until the browser is idle so analytics never delays interaction.
    const run = () => track("$pageview", { $current_url: window.location.origin + pathname + (qs ? `?${qs}` : "") });
    const idle = typeof window.requestIdleCallback === "function";
    const id = idle ? window.requestIdleCallback(run, { timeout: 3000 }) : setTimeout(run, 1500);
    return () => (idle ? window.cancelIdleCallback(id as number) : clearTimeout(id));
  }, [pathname, searchParams]);
  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  );
}
