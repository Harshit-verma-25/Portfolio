"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Brain, Cloud, Code2, Database, Server, Workflow } from "lucide-react";
import { SectionHeading } from "@/components/motion/section-heading";
import { CountUp } from "@/components/motion/count-up";
import { useInViewOnce } from "@/hooks/use-media";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORIES, type Skill, type SkillCategory } from "@/types";

const META: Record<SkillCategory, { label: string; icon: typeof Code2; color: string; blurb: string }> = {
  frontend: { label: "Frontend", icon: Code2, color: "#6366F1", blurb: "Interfaces that feel instant and polished." },
  backend: { label: "Backend", icon: Server, color: "#8B5CF6", blurb: "APIs, auth and business logic." },
  database: { label: "Database", icon: Database, color: "#22C55E", blurb: "Relational modelling and access control." },
  cloud: { label: "Cloud", icon: Cloud, color: "#06B6D4", blurb: "Managed services, storage and delivery." },
  ai: { label: "AI", icon: Brain, color: "#F472B6", blurb: "LLM features that are grounded and useful." },
  devops: { label: "DevOps", icon: Workflow, color: "#F59E0B", blurb: "Shipping pipeline and environments." },
};

function SkillBar({ skill, color, index, active }: { skill: Skill; color: string; index: number; active: boolean }) {
  return (
    <li className="group/skill rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-zinc-100">{skill.name}</span>
        <span className="font-mono text-[11px] text-zinc-400">
          {skill.years}y · {skill.proficiency}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="meter" aria-label={`${skill.name} proficiency`} aria-valuenow={skill.proficiency} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full origin-left rounded-full transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover/skill:brightness-125 motion-reduce:transition-none"
          style={{
            width: `${skill.proficiency}%`,
            transform: `scaleX(${active ? 1 : 0})`,
            transitionDelay: `${index * 70}ms`,
            background: `linear-gradient(90deg, ${color}, #06B6D4)`,
          }}
        />
      </div>
    </li>
  );
}

function CategoryCard({ category, skills }: { category: SkillCategory; skills: Skill[] }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const meta = META[category];
  const Icon = meta.icon;
  return (
    <div
      ref={ref}
      className="glass group h-full rounded-3xl p-5 transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-white/15 motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-start justify-between px-3 pt-1">
        <div>
          <span className="grid size-10 place-items-center rounded-xl" style={{ background: `${meta.color}1f`, color: meta.color }}>
            <Icon className="size-5" aria-hidden />
          </span>
          <h3 className="mt-4 text-lg font-semibold">{meta.label}</h3>
          <p className="mt-1 text-sm text-muted">{meta.blurb}</p>
        </div>
        <span className="font-mono text-xs text-zinc-400">{String(skills.length).padStart(2, "0")}</span>
      </div>
      <ul className="mt-4 space-y-0.5">
        {skills.map((s, i) => (
          <SkillBar key={s.id} skill={s} color={meta.color} index={i} active={inView} />
        ))}
      </ul>
    </div>
  );
}

export function SkillsGrid({ skills }: { skills: Skill[] }) {
  const [filter, setFilter] = useState<SkillCategory | "all">("all");

  const groups = useMemo(() => {
    const map = new Map<SkillCategory, Skill[]>();
    for (const c of SKILL_CATEGORIES) map.set(c, []);
    skills.forEach((s) => map.get(s.category)?.push(s));
    return [...map.entries()].filter(([, list]) => list.length > 0);
  }, [skills]);

  if (skills.length === 0) return null;

  const visible = filter === "all" ? groups : groups.filter(([c]) => c === filter);
  const avg = Math.round(skills.reduce((n, s) => n + s.proficiency, 0) / skills.length);

  return (
    <section id="skills" aria-labelledby="skills-title" className="section">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <SectionHeading id="skills-title" eyebrow="Skills" title="Sharp tools, used deliberately." description="Proficiency is self-assessed and measured against shipping real products, not tutorials." className="mb-0" />
          <dl className="grid grid-cols-3 gap-6 lg:gap-10">
            {[
              { label: "Technologies", value: skills.length },
              { label: "Disciplines", value: groups.length },
              { label: "Avg. proficiency", value: avg, suffix: "%" },
            ].map((s) => (
              <div key={s.label}>
                <dd className="text-4xl font-semibold tracking-tight text-gradient md:text-5xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </dd>
                <dt className="mt-1 text-xs text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div role="group" aria-label="Filter skills by category" className="mt-12 flex gap-2 overflow-x-auto pb-1">
          {(["all", ...groups.map(([c]) => c)] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                filter === c ? "border-white bg-white text-bg" : "border-line text-muted hover:border-white/20 hover:text-fg",
              )}
            >
              {c === "all" ? "All" : META[c].label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map(([category, list]) => (
              <m.div
                key={category}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <CategoryCard category={category} skills={list} />
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
