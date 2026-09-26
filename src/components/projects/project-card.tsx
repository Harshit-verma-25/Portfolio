import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { ProjectCover } from "./project-cover";

export function ProjectCard({ project, large = false, priority = false }: { project: Project; large?: boolean; priority?: boolean }) {
  return (
    <SpotlightCard glow={project.accent} className="h-full">
      <Link href={`/projects/${project.slug}`} className="flex h-full flex-col focus-visible:outline-none" aria-label={`${project.title} — ${project.tagline}. Read the case study.`}>
        <div className="overflow-hidden">
          <ProjectCover
            project={project}
            priority={priority}
            className={cn("w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]", large ? "aspect-[4/3] md:aspect-[21/9]" : "aspect-[4/3]")}
          />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{project.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{project.tagline}</p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition-all duration-500 group-hover:rotate-45 group-hover:border-white/30 group-hover:bg-white group-hover:text-bg">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
          <ul className="mt-auto flex flex-wrap gap-2" aria-label="Tech stack">
            {project.tech.slice(0, 5).map((t) => (
              <li key={t} className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-zinc-400">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </SpotlightCard>
  );
}
