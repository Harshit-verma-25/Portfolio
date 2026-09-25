"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SkillsGalaxy } from "@/components/three/lazy";
import { SectionHeading } from "@/components/motion/section-heading";
import { useUI } from "@/store/ui";
import { usePrefersReducedMotion } from "@/hooks/use-media";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { Skill, SkillCategory } from "@/types";

const PLANET_META: Record<SkillCategory, { name: string; color: string; blurb: string }> = {
  frontend: { name: "Frontend", color: "#6366F1", blurb: "Interfaces that feel instant: server components, motion design and pixel-level polish." },
  backend: { name: "Backend", color: "#8B5CF6", blurb: "APIs, auth, background jobs and the business logic behind every click." },
  cloud: { name: "Cloud", color: "#06B6D4", blurb: "Serverless deployments, managed Postgres, storage and edge delivery." },
  ai: { name: "AI", color: "#F472B6", blurb: "LLM-powered features that are grounded, safe and actually useful." },
  database: { name: "Data", color: "#22C55E", blurb: "Relational modelling, row-level security and query performance." },
  tools: { name: "Tooling", color: "#F59E0B", blurb: "The workflow that keeps shipping fast: Git, containers and design tools." },
};

export function SkillsUniverse({ skills }: { skills: Skill[] }) {
  const reduced = usePrefersReducedMotion();
  const { activePlanet, setActivePlanet } = useUI();

  const planets = useMemo(() => {
    const groups = new Map<SkillCategory, Skill[]>();
    skills.forEach((s) => groups.set(s.category, [...(groups.get(s.category) ?? []), s]));
    return [...groups.entries()].map(([id, list]) => ({ id, ...PLANET_META[id], skills: list.sort((a, b) => a.order_index - b.order_index) }));
  }, [skills]);

  const active = planets.find((p) => p.id === activePlanet) ?? null;

  const select = (id: string) => {
    const next = activePlanet === id ? null : id;
    setActivePlanet(next);
    if (next) track("planet_opened", { planet: next });
  };

  return (
    <section id="skills" aria-labelledby="skills-title" className="section overflow-hidden">
      <div className="container-page">
        <SectionHeading id="skills-title" eyebrow="Skills universe" title="A galaxy of tools, organised by gravity." description="Each planet is a discipline; its moons are the tools I use there. Click a planet — or use the buttons — to fly in." />
      </div>

      <div className="container-page">
        <div className="relative h-[70svh] min-h-[480px] overflow-hidden rounded-[2rem] border border-line bg-[#040612]">
          {!reduced && <SkillsGalaxy planets={planets.map(({ id, name, color, skills }) => ({ id, name, color, skills: skills.map((s) => s.name) }))} />}
          {reduced && <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25),transparent_60%)]" />}

          {/* Planet selector — keyboard & touch friendly */}
          <div role="toolbar" aria-label="Skill planets" className="absolute inset-x-3 bottom-3 z-10 flex gap-2 overflow-x-auto pb-1 md:inset-x-auto md:left-6 md:top-6 md:bottom-auto md:flex-col md:overflow-visible">
            {planets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => select(p.id)}
                aria-pressed={activePlanet === p.id}
                className={cn(
                  "glass flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2 text-sm transition",
                  activePlanet === p.id ? "bg-white/15 text-fg" : "text-zinc-300 hover:text-fg",
                )}
              >
                <span className="size-2.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 12px ${p.color}` }} />
                {p.name}
                <span className="font-mono text-[10px] text-muted">{p.skills.length}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {active && (
              <motion.aside
                key={active.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                aria-live="polite"
                className="glass absolute inset-x-3 top-3 z-20 max-h-[calc(100%-5.5rem)] overflow-y-auto rounded-3xl p-6 md:inset-x-auto md:bottom-6 md:right-6 md:top-6 md:max-h-none md:w-[24rem]"
                data-lenis-prevent
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest" style={{ color: active.color }}>
                      Planet
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold">{active.name}</h3>
                  </div>
                  <button type="button" onClick={() => setActivePlanet(null)} className="rounded-full p-2 text-muted hover:bg-white/10 hover:text-fg" aria-label="Close planet details">
                    <X className="size-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{active.blurb}</p>
                <ul className="mt-6 space-y-4">
                  {active.skills.map((s, i) => (
                    <li key={s.id}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-medium">{s.name}</span>
                        <span className="font-mono text-xs text-muted">
                          {s.years}y · {s.proficiency}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="meter" aria-valuenow={s.proficiency} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name} proficiency`}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${active.color}, #06B6D4)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.proficiency}%` }}
                          transition={{ delay: 0.15 + i * 0.05, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
