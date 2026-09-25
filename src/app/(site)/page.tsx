import { Suspense } from "react";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { NowBuilding } from "@/components/sections/now-building";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { CareerTimeline } from "@/components/sections/career-timeline";
import { SkillsUniverse } from "@/components/sections/skills-universe";
import { Testimonials } from "@/components/sections/testimonials";
import { Achievements } from "@/components/sections/achievements";
import { GithubActivity, GithubActivitySkeleton } from "@/components/sections/github-activity";
import { TechStack } from "@/components/sections/tech-stack";
import { TerminalSection } from "@/components/sections/terminal-section";
import { Contact } from "@/components/sections/contact";
import { SectionHeading } from "@/components/motion/section-heading";
import { ExperienceList } from "@/components/sections/experience-list";
import {
  getAchievements,
  getCertifications,
  getExperiences,
  getFeaturedProjects,
  getMilestones,
  getProfile,
  getProjects,
  getSkills,
  getTechStack,
  getTestimonials,
} from "@/lib/content";

export const revalidate = 3600;

export default async function HomePage() {
  const [profile, featured, projects, experiences, skills, testimonials, achievements, certifications] = await Promise.all([
    getProfile(),
    getFeaturedProjects(),
    getProjects(),
    getExperiences(),
    getSkills(),
    getTestimonials(),
    getAchievements(),
    getCertifications(),
  ]);

  const terminalData = {
    profile,
    projects: projects.map(({ slug, title, tagline, category, tech }) => ({ slug, title, tagline, category, tech })),
    skills: skills.map(({ name, category, proficiency }) => ({ name, category, proficiency })),
    experiences: experiences.map(({ company, position, start_date, end_date }) => ({ company, position, start_date, end_date })),
  };

  return (
    <>
      <Hero profile={profile} />
      <About profile={profile} />
      <NowBuilding now={profile.now_building} />
      <FeaturedProjects projects={featured.length ? featured : projects} />
      <section id="experience" aria-labelledby="experience-title" className="section pb-0">
        <div className="container-page">
          <SectionHeading id="experience-title" eyebrow="Experience" title="Where I've shipped." />
          <ExperienceList experiences={experiences} />
        </div>
      </section>
      <CareerTimeline milestones={getMilestones()} />
      <SkillsUniverse skills={skills} />
      <Testimonials testimonials={testimonials} />
      <Achievements achievements={achievements} certifications={certifications} />
      <Suspense fallback={<GithubActivitySkeleton />}>
        <GithubActivity />
      </Suspense>
      <TechStack stack={getTechStack()} />
      <TerminalSection data={terminalData} />
      <Contact profile={profile} />
    </>
  );
}
