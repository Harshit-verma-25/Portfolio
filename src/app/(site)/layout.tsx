import { SiteProviders } from "@/components/layout/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { Assistant } from "@/components/chat/assistant";
import { TerminalOverlay } from "@/components/terminal/terminal-overlay";
import { JsonLd, personJsonLd, websiteJsonLd } from "@/components/seo/json-ld";
import { getExperiences, getProfile, getProjects, getSkills } from "@/lib/content";
import { toTerminalData } from "@/components/terminal/terminal-data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, projects, skills, experiences] = await Promise.all([getProfile(), getProjects(), getSkills(), getExperiences()]);
  const terminalData = toTerminalData({ profile, projects, skills, experiences });

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
      <div aria-hidden className="noise" />
    </SiteProviders>
  );
}
