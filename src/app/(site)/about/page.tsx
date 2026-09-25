import type { Metadata } from "next";
import Image from "next/image";
import { Download, Target, Heart, Zap, Eye } from "lucide-react";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Aurora } from "@/components/layout/aurora";
import { CareerTimeline } from "@/components/sections/career-timeline";
import { NowBuilding } from "@/components/sections/now-building";
import { ResumeButton } from "@/components/sections/resume-button";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { getMilestones, getProfile } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description: "The story, values and goals of Harshit Verma — a full stack developer from New Delhi building fast, accessible, AI-native products.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: Target, title: "Ownership", body: "I treat every feature like a product I'll support for years — from the first sketch to the dashboards after launch." },
  { icon: Zap, title: "Speed with care", body: "Ship small, ship often, measure everything. Fast iteration and high quality aren't opposites." },
  { icon: Eye, title: "Clarity", body: "Readable code, honest estimates and clear writing. Complexity is a cost, not a flex." },
  { icon: Heart, title: "Craft", body: "The last 10% — motion, accessibility, empty states — is where products earn trust." },
];

const GOALS = [
  { horizon: "Now", goal: "Grow as a product-minded full stack engineer shipping AI-native features in production." },
  { horizon: "Next", goal: "Lead the architecture of a product end-to-end and mentor other developers." },
  { horizon: "Long term", goal: "Build tools that make high-quality software accessible to more teams in India and beyond." },
];

export default async function AboutPage() {
  const profile = await getProfile();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <section className="relative overflow-hidden pb-20 pt-40">
        <Aurora intensity={0.7} />
        <div className="container-page relative grid gap-14 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div>
            <Reveal>
              <p className="eyebrow mb-4">About</p>
            </Reveal>
            <TextReveal as="h1" immediate text="Engineer by training. Product builder by instinct." className="text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl" wordClassName="text-gradient" />
            <Reveal delay={0.3}>
              <div className="mt-10 flex flex-wrap gap-3">
                <ResumeButton href={profile.resume_url} source="about">
                  <Download /> Download résumé
                </ResumeButton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="border-gradient relative aspect-square overflow-hidden rounded-[2rem]">
              <Image src={profile.avatar_url} alt={`Portrait of ${profile.name}`} fill priority sizes="(max-width: 768px) 90vw, 30vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page grid gap-10 pb-16 md:grid-cols-[0.35fr_0.65fr]" aria-labelledby="story-title">
        <Reveal>
          <h2 id="story-title" className="eyebrow">
            The story
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-6 text-xl leading-relaxed text-zinc-300">
            <p>{profile.bio}</p>
            <p>
              I started with HTML and CSS in school, won my first coding medals blindfolded (literally — a blind coding contest), and went on to study Computer Applications at VIPS in New Delhi. Along the
              way I shipped products across AI, EdTech, SaaS and astronomy, and turned an internship at {profile.now_building.company} into a full-time engineering role.
            </p>
            <p>Today I care most about the space between design and engineering: turning ambiguous ideas into systems that are fast, accessible and a pleasure to use.</p>
          </div>
        </Reveal>
      </section>

      <NowBuilding now={profile.now_building} />

      <section className="section" aria-labelledby="values-title">
        <div className="container-page">
          <h2 id="values-title" className="mb-12 text-4xl font-semibold tracking-tight text-gradient md:text-5xl">
            Values I build by.
          </h2>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <StaggerItem key={title}>
                <div className="glass h-full rounded-3xl p-7">
                  <Icon className="size-5 text-accent" aria-hidden />
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CareerTimeline milestones={getMilestones()} />

      <section className="section" aria-labelledby="goals-title">
        <div className="container-page">
          <h2 id="goals-title" className="mb-12 text-4xl font-semibold tracking-tight text-gradient md:text-5xl">
            Where I&apos;m headed.
          </h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {GOALS.map((g, i) => (
              <Reveal as="li" key={g.horizon} delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-line p-7">
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">{g.horizon}</p>
                  <p className="mt-4 text-lg leading-relaxed">{g.goal}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
