import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { ProjectHeroVisual } from "@/components/projects/project-hero";
import { ArchitectureFlow } from "@/components/projects/architecture-flow";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Button } from "@/components/ui/button";
import { JsonLd, breadcrumbJsonLd, projectJsonLd } from "@/components/seo/json-ld";
import { getProjectBySlug, getProjects } from "@/lib/content";
import { projects as staticProjects } from "@/lib/data/content";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return staticProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Case study`,
    description: `${project.tagline} ${project.description}`.slice(0, 160),
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title} — Case study`, description: project.tagline, type: "article" },
  };
}

function Block({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-16 md:grid-cols-[0.35fr_0.65fr] md:gap-16">
      <Reveal>
        <p className="eyebrow">{label}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
      </Reveal>
      <Reveal delay={0.1}>{children}</Reveal>
    </section>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProjectBySlug(slug), getProjects()]);
  if (!project) notFound();
  const cs = project.case_study;
  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all[(idx + 1) % all.length];
  let section = 0;
  const n = (label: string) => `${String(++section).padStart(2, "0")} — ${label}`;

  return (
    <article className="pb-24 pt-32">
      <JsonLd data={[projectJsonLd(project), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }, { name: project.title, path: `/projects/${project.slug}` }])]} />
      <div className="container-page">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg">
          <ArrowLeft className="size-4" /> All projects
        </Link>

        <header className="mt-10 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="eyebrow mb-4" style={{ color: project.accent }}>
              {project.category} · {project.year}
            </p>
            <TextReveal as="h1" immediate text={project.title} className="text-6xl font-semibold leading-none tracking-tight md:text-8xl" wordClassName="text-gradient" />
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-zinc-300">{project.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {project.github_url && (
              <Button asChild variant="outline">
                <a href={project.github_url} target="_blank" rel="noreferrer">
                  <Github /> Source
                </a>
              </Button>
            )}
            {project.live_url && (
              <Button asChild variant="brand">
                <a href={project.live_url} target="_blank" rel="noreferrer">
                  Live site <ArrowUpRight />
                </a>
              </Button>
            )}
          </div>
        </header>

        <div className="mt-12">
          <ProjectHeroVisual project={project} />
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            ["Category", project.category],
            ["Year", String(project.year)],
            ["Role", "Design & full stack engineering"],
            ["Stack", project.tech.slice(0, 3).join(", ")],
          ].map(([k, v]) => (
            <div key={k} className="border-l border-line pl-4">
              <dt className="text-xs uppercase tracking-wider text-muted">{k}</dt>
              <dd className="mt-1 font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-16 max-w-3xl text-lg leading-relaxed text-zinc-300">
          <p>{project.description}</p>
        </div>

        {cs && (
          <div className="mt-10">
            {cs.metrics.length > 0 && (
              <Stagger className="grid gap-4 py-10 sm:grid-cols-3">
                {cs.metrics.map((m) => (
                  <StaggerItem key={m.label}>
                    <div className="glass rounded-3xl p-6">
                      <p className="text-4xl font-semibold tracking-tight text-gradient">{m.value}</p>
                      <p className="mt-2 text-sm text-muted">{m.label}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            <Block label={n("Problem")} title="What needed solving">
              <p className="text-lg leading-relaxed text-zinc-300">{cs.problem}</p>
            </Block>
            <Block label={n("Research")} title="What we learned">
              <p className="text-lg leading-relaxed text-zinc-300">{cs.research}</p>
            </Block>
            <Block label={n("Architecture")} title="How it's built">
              <p className="text-lg leading-relaxed text-zinc-300">{cs.architecture}</p>
              {cs.architecture_nodes && cs.architecture_nodes.length > 0 && (
                <div className="mt-8">
                  <ArchitectureFlow nodes={cs.architecture_nodes} accent={project.accent} />
                </div>
              )}
            </Block>
            <Block label={n("Challenges")} title="Hard parts, solved">
              <ul className="grid gap-4">
                {cs.challenges.map((c) => (
                  <li key={c.title} className="glass rounded-2xl p-6">
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{c.detail}</p>
                  </li>
                ))}
              </ul>
            </Block>
            <Block label={n("Features")} title="What it does">
              <ul className="grid gap-3 sm:grid-cols-2">
                {cs.features.map((f) => (
                  <li key={f} className="flex gap-3 rounded-2xl border border-line p-4 text-sm text-zinc-300">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: project.accent }} />
                    {f}
                  </li>
                ))}
              </ul>
            </Block>
            {(project.images.length > 0 || project.video_url) && (
              <Block label={n("Screenshots")} title="A closer look">
                <div className="grid gap-4">
                  {project.video_url && (
                    <video src={project.video_url} controls playsInline preload="metadata" className="w-full rounded-2xl border border-line" aria-label={`${project.title} demo video`} />
                  )}
                  {project.images.map((src, i) => (
                    <div key={src} className="relative aspect-video overflow-hidden rounded-2xl border border-line">
                      <Image src={src} alt={`${project.title} screenshot ${i + 1}`} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </Block>
            )}
            <Block label={n("Tech stack")} title="Tools of choice">
              <ul className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <li key={t} className="rounded-full border border-line bg-white/[0.03] px-4 py-2 text-sm">
                    {t}
                  </li>
                ))}
              </ul>
            </Block>
            <Block label={n("Results")} title="Outcomes">
              <ul className="space-y-3">
                {cs.results.map((r) => (
                  <li key={r} className="flex gap-3 text-lg text-zinc-300">
                    <ArrowRight className="mt-1.5 size-4 shrink-0 text-accent" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
            </Block>
          </div>
        )}

        {next && next.slug !== project.slug && (
          <section className="mt-16 border-t border-line pt-16" aria-labelledby="next-title">
            <p id="next-title" className="eyebrow mb-6">
              Next project
            </p>
            <div className="max-w-2xl">
              <ProjectCard project={next} />
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
