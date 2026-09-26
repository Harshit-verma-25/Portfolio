"use client";

import type { PostHog } from "posthog-js";

export type AnalyticsEvent =
  | "resume_downloaded"
  | "project_viewed"
  | "contact_submitted"
  | "assistant_message"
  | "terminal_command"
  | "calendly_opened";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let client: Promise<PostHog | null> | null = null;

/**
 * PostHog is loaded lazily (after the page is interactive) so it never competes with first
 * paint. Returns null when no key is configured.
 */
export function getPostHog(): Promise<PostHog | null> {
  if (!KEY || typeof window === "undefined") return Promise.resolve(null);
  client ??= import("posthog-js").then(({ default: posthog }) => {
    if (!posthog.__loaded) {
      posthog.init(KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
        ui_host: "https://us.posthog.com",
        capture_pageview: false, // captured manually on route change
        capture_pageleave: true,
        person_profiles: "identified_only",
        respect_dnt: true,
      });
    }
    return posthog;
  });
  return client;
}

/** Fire a product analytics event (no-op when PostHog isn't configured). */
export function track(event: AnalyticsEvent | "$pageview", properties?: Record<string, unknown>) {
  void getPostHog().then((ph) => ph?.capture(event, properties));
}

/**
 * First-party counter for events we also want in Supabase (résumé downloads, project views),
 * so the admin dashboard has numbers even when PostHog is blocked.
 */
export function recordEvent(event: "resume_download" | "project_view", ref?: string) {
  const body = JSON.stringify({ event, ref });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
  else void fetch("/api/events", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
}
