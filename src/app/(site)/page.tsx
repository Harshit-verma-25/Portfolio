import { Suspense } from "react";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { NowBuilding } from "@/components/sections/now-building";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Timeline } from "@/components/sections/timeline";
import { SkillsGrid } from "@/components/sections/skills-grid";
import { Testimonials } from "@/components/sections/testimonials";
import { Achievements } from "@/components/sections/achievements";
import { GithubActivity, GithubActivitySkeleton } from "@/components/sections/github-activity";
import { TechStack } from "@/components/sections/tech-stack";
import { TerminalSection } from "@/components/sections/terminal-section";
import { Contact } from "@/components/sections/contact";
import { getAchievements, getCertifications, getExperiences, getProfile, getProjects, getSkills, getTestimonials } from "@/lib/content";
import { toTerminalData } from "@/components/terminal/terminal-data";

export const revalidate = 3600;

export default async function HomePage() {
  const [profile, projects, experiences, skills, testimonials, achievements, certifications] = await Promise.all([
    getProfile(),
    getProjects(),
    getExperiences(),
    getSkills(),
    getTestimonials(),
    getAchievements(),
    getCertifications(),
  ]);
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      <Hero profile={profile} />
      {profile.bio && <About profile={profile} />}
      {profile.now_building.company && <NowBuilding now={profile.now_building} />}
      <FeaturedProjects projects={featured.length ? featured : projects} />
      <Timeline experiences={experiences} />
      <SkillsGrid skills={skills} />
      <Testimonials testimonials={testimonials} />
      <Achievements achievements={achievements} certifications={certifications} />
      <Suspense fallback={<GithubActivitySkeleton />}>
        <GithubActivity />
      </Suspense>
      <TechStack skills={skills} />
      <TerminalSection data={toTerminalData({ profile, projects, skills, experiences })} />
      <Contact profile={profile} />
    </>
  );
}
