"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Briefcase, Code2, GraduationCap, Users } from "lucide-react";
import { TimelineSpine } from "@/components/three/lazy";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/use-media";
import { cn } from "@/lib/utils";
import type { Milestone } from "@/types";

const ICONS = { education: GraduationCap, work: Briefcase, project: Code2, community: Users };

function FloatingCard({ m, i, count, progress }: { m: Milestone; i: number; count: number; progress: MotionValue<number> }) {
  // local = 0 when this card is centred; negative before, positive after.
  const local = useTransform(progress, (p) => p * (count - 1) - i);
  const y = useTransform(local, (l) => `${-l * 60}vh`);
  const opacity = useTransform(local, (l) => 1 - Math.min(1, Math.abs(l) * 1.1));
  const rotateX = useTransform(local, (l) => l * 28);
  const z = useTransform(local, (l) => -Math.abs(l) * 220);
  const Icon = ICONS[m.kind];
  const left = i % 2 === 0;
  return (
    <motion.article
      style={{ y, opacity, rotateX, z }}
      className={cn("absolute top-1/2 w-[min(26rem,40vw)] -translate-y-1/2 [transform-style:preserve-3d]", left ? "right-[56%]" : "left-[56%]")}
    >
      <div className="glass border-gradient rounded-3xl p-7 shadow-[0_30px_80px_-30px_rgba(99,102,241,0.6)]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-4xl font-semibold text-gradient-brand">{m.year}</span>
          <span className="grid size-10 place-items-center rounded-full bg-white/[0.06]">
            <Icon className="size-4 text-accent" />
          </span>
        </div>
        <h3 className="mt-5 text-xl font-semibold">{m.title}</h3>
        <p className="mt-1 text-sm text-indigo-200/80">{m.subtitle}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">{m.description}</p>
      </div>
    </motion.article>
  );
}

/** Desktop: pinned 3D helix + floating cards driven by scroll. Mobile/reduced motion: a vertical rail. */
export function CareerTimeline({ milestones }: { milestones: Milestone[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const immersive = !mobile && !reduced;

  return (
    <section id="journey" aria-labelledby="journey-title" className="relative">
      <div className="container-page section pb-0">
        <SectionHeading id="journey-title" eyebrow="Journey" title="From first HTML tag to production systems." description="A scroll through the milestones that shaped how I build." />
      </div>

      {immersive ? (
        <div ref={ref} style={{ height: `${milestones.length * 70}vh` }} className="relative">
          <div className="sticky top-0 h-screen overflow-hidden [perspective:1400px]">
            <TimelineSpine count={milestones.length} progress={scrollYProgress} />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
            {milestones.map((m, i) => (
              <FloatingCard key={m.id} m={m} i={i} count={milestones.length} progress={scrollYProgress} />
            ))}
          </div>
          {/* Screen-reader & no-JS friendly version of the same content */}
          <ol className="sr-only">
            {milestones.map((m) => (
              <li key={m.id}>
                {m.year}: {m.title} — {m.subtitle}. {m.description}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <ol className="container-page relative space-y-6 pb-10 before:absolute before:bottom-0 before:left-[calc(clamp(1rem,4vw,2rem)+11px)] before:top-0 before:w-px before:bg-gradient-to-b before:from-primary before:via-secondary before:to-accent">
          {milestones.map((m) => {
            const Icon = ICONS[m.kind];
            return (
              <Reveal as="li" key={m.id} className="relative pl-12">
                <span className="absolute left-0 top-6 grid size-6 place-items-center rounded-full border border-primary/50 bg-bg">
                  <span className="size-2 rounded-full bg-accent" />
                </span>
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-semibold text-gradient-brand">{m.year}</span>
                    <Icon className="size-4 text-accent" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{m.title}</h3>
                  <p className="text-sm text-indigo-200/80">{m.subtitle}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{m.description}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      )}
    </section>
  );
}
