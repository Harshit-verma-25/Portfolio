"use client";

import { useEffect } from "react";
import { recordEvent, track } from "@/lib/analytics";

/** Records a project view once per page load (PostHog + first-party counter). */
export function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    track("project_viewed", { slug });
    recordEvent("project_view", slug);
  }, [slug]);
  return null;
}
