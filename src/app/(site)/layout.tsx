import { SiteProviders } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { Assistant } from "@/components/chat/assistant";
import { TerminalOverlay } from "@/components/terminal/terminal-overlay";
import { JsonLd, personJsonLd, websiteJsonLd } from "@/components/seo/json-ld";
import { getExperiences, getProfile, getProjects, getSkills } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, projects, skills, experiences] = await Promise.all([getProfile(), getProjects(), getSkills(), getExperiences()]);
  const terminalData = {
    profile,
    projects: projects.map(({ slug, title, tagline, category, tech }) => ({ slug, title, tagline, category, tech })),
    skills: skills.map(({ name, category, proficiency }) => ({ name, category, proficiency })),
    experiences: experiences.map(({ company, position, start_date, end_date }) => ({ company, position, start_date, end_date })),
  };

  return (
    <SiteProviders>
      <a href="#main" className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-full bg-white px-4 py-2 text-sm font-medium text-bg transition focus:translate-y-0">
        Skip to content
      </a>
      <JsonLd data={[personJsonLd(profile), websiteJsonLd()]} />
      <ScrollProgress />
      <Navbar />
      <main id="main" tabIndex={-1} className="relative focus:outline-none">
        {children}
      </main>
      <Footer profile={profile} />
      <Assistant />
      <TerminalOverlay data={terminalData} />
      <CustomCursor />
      <div aria-hidden className="noise" />
    </SiteProviders>
  );
}
