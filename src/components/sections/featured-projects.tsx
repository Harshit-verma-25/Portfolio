import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section id="work" aria-labelledby="work-title" className="section">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="work-title" eyebrow="Selected work" title="Products, not just projects." description="Each one started with a real problem and shipped with a real architecture. Open any card for the full case study." className="mb-0" />
          <Reveal>
            <Button asChild variant="outline">
              <Link href="/projects">
                All projects <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {projects.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 0.1} className={i === 0 ? "md:col-span-2" : undefined}>
              <ProjectCard project={p} large={i === 0} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
