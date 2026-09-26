"use client";

import { useMemo, useRef } from "react";
import { m, useScroll, useSpring } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/motion/section-heading";
import { cn, formatRange } from "@/lib/utils";
import type { Experience } from "@/types";

const EASE = [0.16, 1, 0.3, 1] as const;

function Entry({ exp, index }: { exp: Experience; index: number }) {
  const education = exp.employment_type === "Education";
  const Icon = education ? GraduationCap : Briefcase;
  const current = !exp.end_date;
  return (
    <m.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
      className="relative pl-10 md:pl-12"
    >
      {/* Node on the rail */}
      <span aria-hidden className={cn("absolute left-0 top-6 grid size-[22px] -translate-x-1/2 place-items-center rounded-full border bg-bg", current ? "border-accent" : "border-line-strong")}>
        <span className={cn("size-2 rounded-full", current ? "animate-pulse-soft bg-accent" : "bg-zinc-400")} />
      </span>
      <article className="glass rounded-3xl p-6 transition-[transform,border-color] duration-500 hover:-translate-y-0.5 hover:border-white/15 md:p-7 motion-reduce:hover:translate-y-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/15">
              <Icon className="size-5 text-indigo-200" aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold leading-snug md:text-xl">{exp.position}</h3>
              <p className="text-sm text-muted">
                {exp.company}
                {exp.location && ` · ${exp.location}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-zinc-300">{exp.employment_type}</span>
            {current && <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-medium text-green-300">Current</span>}
          </div>
        </div>
        <p className="mt-4 font-mono text-xs text-zinc-400">{formatRange(exp.start_date, exp.end_date)}</p>
        {exp.description && <p className="mt-3 leading-relaxed text-zinc-300">{exp.description}</p>}
        {exp.achievements.length > 0 && (
          <ul className="mt-4 space-y-2">
            {exp.achievements.map((a) => (
              <li key={a} className="flex gap-3 text-sm text-zinc-300">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {a}
              </li>
            ))}
          </ul>
        )}
        {exp.tech.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
            {exp.tech.map((t) => (
              <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-zinc-400">
                {t}
              </li>
            ))}
          </ul>
        )}
      </article>
    </m.li>
  );
}

/**
 * Experience & education timeline. Entries are grouped by start year; each year label sticks
 * while its entries scroll past, and the rail fills in as you progress through the section.
 */
export function Timeline({ experiences, eyebrow = "Experience", title = "Where I've learned and shipped.", heading = true }: { experiences: Experience[]; eyebrow?: string; title?: string; heading?: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const years = useMemo(() => {
    const map = new Map<string, Experience[]>();
    experiences.forEach((e) => {
      const y = e.start_date.slice(0, 4);
      map.set(y, [...(map.get(y) ?? []), e]);
    });
    return [...map.entries()];
  }, [experiences]);

  if (experiences.length === 0) return null;

  return (
    <section id="experience" aria-labelledby={heading ? "experience-title" : undefined} aria-label={heading ? undefined : "Timeline"} className="section">
      <div className="container-page">
        {heading && <SectionHeading id="experience-title" eyebrow={eyebrow} title={title} />}
        <div ref={railRef} className="relative md:grid md:grid-cols-[140px_1fr] md:gap-10">
          {/* Rail + progress fill (positioned on the entries column) */}
          <div aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-line md:left-[calc(140px+2.5rem)]">
            <m.div className="h-full w-full origin-top bg-gradient-to-b from-primary via-secondary to-accent" style={{ scaleY: progress }} />
          </div>

          <div className="contents">
            {years.map(([year, items]) => (
              <div key={year} className="md:col-span-2 md:grid md:grid-cols-[140px_1fr] md:gap-10">
                <div className="relative z-10 md:block">
                  <p className="sticky top-24 mb-4 inline-block rounded-full border border-line bg-bg/80 px-3 py-1 font-mono text-sm text-zinc-300 backdrop-blur md:mb-0 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:font-sans md:text-5xl md:font-semibold md:tracking-tight md:backdrop-blur-none">
                    <span className="md:text-gradient">{year}</span>
                  </p>
                </div>
                <ol className="space-y-6 pb-12">
                  {items.map((exp, i) => (
                    <Entry key={exp.id} exp={exp} index={i} />
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
