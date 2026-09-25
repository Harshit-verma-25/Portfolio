"use client";

import dynamic from "next/dynamic";

/** Soft gradient placeholder shown while a WebGL chunk downloads. */
function ScenePlaceholder() {
  return <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_65%)]" />;
}

// Every scene is code-split and client-only: three.js never touches the server bundle or first paint.
export const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false, loading: ScenePlaceholder });
export const SkillsGalaxy = dynamic(() => import("./skills-galaxy"), { ssr: false, loading: ScenePlaceholder });
export const TimelineSpine = dynamic(() => import("./timeline-spine"), { ssr: false, loading: ScenePlaceholder });
export const ProjectWorldScene = dynamic(() => import("./project-worlds"), { ssr: false, loading: ScenePlaceholder });
