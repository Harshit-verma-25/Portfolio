"use client";

import posthog from "posthog-js";

export type AnalyticsEvent =
  | "resume_downloaded"
  | "project_viewed"
  | "contact_submitted"
  | "assistant_message"
  | "terminal_command"
  | "planet_opened"
  | "calendly_opened";

/** Fire a product analytics event to PostHog (no-op when PostHog isn't configured). */
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

/**
 * Server-side counter for events we also want in Supabase (resume downloads, project views),
 * so the admin dashboard still has numbers when PostHog is blocked.
 */
export function recordEvent(event: "resume_download" | "project_view", ref?: string) {
  const body = JSON.stringify({ event, ref });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
  else void fetch("/api/events", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
}
