"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn, formatRange } from "@/lib/utils";
import type { Experience } from "@/types";

/** Interactive role list — each role expands to reveal achievements and stack. */
export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  const [open, setOpen] = useState<string | null>(experiences[0]?.id ?? null);
  return (
    <ol className="relative space-y-4">
      {experiences.map((exp, i) => {
        const isOpen = open === exp.id;
        return (
          <Reveal as="li" key={exp.id} delay={i * 0.06}>
            <div className={cn("glass overflow-hidden rounded-3xl transition-colors", isOpen && "border-primary/40 bg-white/[0.06]")}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : exp.id)}
                aria-expanded={isOpen}
                aria-controls={`exp-${exp.id}`}
                className="flex w-full flex-col gap-3 p-6 text-left md:flex-row md:items-center md:justify-between md:p-8"
              >
                <div className="flex items-center gap-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 font-semibold">
                    {exp.company.slice(0, 1)}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold md:text-xl">{exp.position}</h3>
                    <p className="text-sm text-muted">
                      {exp.company} · {exp.employment_type} · {exp.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-[4.25rem] md:pl-0">
                  <span className="font-mono text-xs text-zinc-400">{formatRange(exp.start_date, exp.end_date)}</span>
                  {!exp.end_date && <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-green-300">Current</span>}
                  <ChevronDown className={cn("size-4 text-muted transition-transform duration-300", isOpen && "rotate-180")} />
                </div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`exp-${exp.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="border-t border-line px-6 pb-7 pt-5 md:px-8">
                      <p className="text-muted">{exp.description}</p>
                      <ul className="mt-5 space-y-2.5">
                        {exp.achievements.map((a) => (
                          <li key={a} className="flex gap-3 text-sm text-zinc-300">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                            {a}
                          </li>
                        ))}
                      </ul>
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {exp.tech.map((t) => (
                          <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-zinc-400">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
