import type { Metadata } from "next";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Aurora } from "@/components/layout/aurora";
import { Timeline } from "@/components/sections/timeline";
import { Achievements } from "@/components/sections/achievements";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { getAchievements, getCertifications, getExperiences } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Experience",
  description: "Roles, companies and achievements — Harshit Verma's professional experience as a full stack developer.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const [experiences, achievements, certifications] = await Promise.all([getExperiences(), getAchievements(), getCertifications()]);
  const work = experiences.filter((e) => e.employment_type !== "Education");
  const companies = new Set(work.map((e) => e.company)).size;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Experience", path: "/experience" }])} />
      <section className="relative overflow-hidden pb-16 pt-40">
        <Aurora intensity={0.6} />
        <div className="container-page relative">
          <Reveal>
            <p className="eyebrow mb-4">Experience</p>
          </Reveal>
          <TextReveal as="h1" immediate text="Shipping real products for real users." className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl" wordClassName="text-gradient" />
          <Reveal delay={0.3}>
            <dl className="mt-12 flex flex-wrap gap-10">
              <div>
                <dt className="text-sm text-muted">Roles</dt>
                <dd className="text-4xl font-semibold">{work.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Companies</dt>
                <dd className="text-4xl font-semibold">{companies}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Achievements</dt>
                <dd className="text-4xl font-semibold">{achievements.length}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>
      <Timeline experiences={experiences} heading={false} />
      <Achievements achievements={achievements} certifications={certifications} />
    </>
  );
}
