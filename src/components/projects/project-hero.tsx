"use client";

import { useEffect } from "react";
import { ProjectWorldScene } from "@/components/three/lazy";
import { usePrefersReducedMotion } from "@/hooks/use-media";
import { recordEvent, track } from "@/lib/analytics";
import type { Project } from "@/types";
import { ProjectCover } from "./project-cover";

export function ProjectHeroVisual({ project }: { project: Project }) {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    track("project_viewed", { slug: project.slug });
    recordEvent("project_view", project.slug);
  }, [project.slug]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[2rem] border border-line bg-[#040612] md:aspect-[21/9]">
      {project.world && !reduced ? (
        <>
          <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 45%, ${project.accent}33, transparent 60%)` }} />
          <ProjectWorldScene world={project.world} accent={project.accent} />
        </>
      ) : (
        <ProjectCover project={project} className="absolute inset-0" priority />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
    </div>
  );
}
