import type { Metadata } from "next";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Aurora } from "@/components/layout/aurora";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { getProjects } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies across full stack, AI, SaaS, EdTech, cloud and open source — including Quyl, VisionCoach, Skygaze India and KahaaniBot.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }])} />
      <section className="relative overflow-hidden pb-12 pt-40">
        <Aurora intensity={0.6} />
        <div className="container-page relative">
          <Reveal>
            <p className="eyebrow mb-4">Work · {projects.length} projects</p>
          </Reveal>
          <TextReveal as="h1" immediate text="Things I've designed, engineered and shipped." className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl" wordClassName="text-gradient" />
        </div>
      </section>
      <section className="container-page pb-32">
        <ProjectsExplorer projects={projects} />
      </section>
    </>
  );
}
