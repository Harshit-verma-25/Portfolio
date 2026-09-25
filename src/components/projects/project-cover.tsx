import { cn } from "@/lib/utils";
import Image from "next/image";
import type { Project } from "@/types";

/**
 * Generative cover art for projects without screenshots: accent-tinted aurora, orbit rings and
 * a monogram. When a cover image is uploaded from the admin it is used instead.
 */
export function ProjectCover({ project, className, priority }: { project: Pick<Project, "title" | "accent" | "cover_image" | "category" | "year">; className?: string; priority?: boolean }) {
  if (project.cover_image) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={project.cover_image} alt={`${project.title} cover`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority={priority} />
      </div>
    );
  }
  const a = project.accent;
  return (
    <div aria-hidden className={cn("relative overflow-hidden bg-[#070b1d]", className)}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 20%, ${a}55, transparent 55%), radial-gradient(circle at 80% 90%, #6366F144, transparent 50%)` }} />
      <div className="grid-bg absolute inset-0 opacity-60" />
      <svg className="absolute inset-0 size-full transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:rotate-6" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke={a} strokeOpacity="0.35">
          <ellipse cx="200" cy="150" rx="150" ry="60" transform="rotate(-15 200 150)" />
          <ellipse cx="200" cy="150" rx="110" ry="110" strokeDasharray="2 6" />
          <ellipse cx="200" cy="150" rx="185" ry="95" transform="rotate(20 200 150)" strokeOpacity="0.18" />
        </g>
        <circle cx="200" cy="150" r="46" fill={a} fillOpacity="0.9" />
        <circle cx="200" cy="150" r="70" fill={a} fillOpacity="0.12" />
        <circle cx="338" cy="112" r="6" fill="#fff" />
        <circle cx="92" cy="200" r="4" fill="#fff" fillOpacity="0.8" />
        <text x="200" y="163" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontWeight="700" fontSize="36" fill="#050816">
          {project.title.slice(0, 2).toUpperCase()}
        </text>
      </svg>
      <div className="absolute left-5 top-5 flex gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60">
        <span>{project.category}</span>
        <span>·</span>
        <span>{project.year}</span>
      </div>
    </div>
  );
}
