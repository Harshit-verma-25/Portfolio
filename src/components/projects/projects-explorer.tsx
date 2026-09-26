"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Search, X } from "lucide-react";
import { PROJECT_CATEGORIES, type Project } from "@/types";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";

const FILTERS = ["All", ...PROJECT_CATEGORIES] as const;

export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  // Deep-linkable filters: /projects?category=AI&q=supabase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("category");
    if (c && (FILTERS as readonly string[]).includes(c)) setFilter(c as (typeof FILTERS)[number]);
    setQuery(params.get("q") ?? "");
  }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "All") params.set("category", filter);
    if (deferred) params.set("q", deferred);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [filter, deferred]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: projects.length };
    projects.forEach((p) => {
      const cats = new Set([p.category, ...p.tags]);
      cats.forEach((c) => (map[c] = (map[c] ?? 0) + 1));
    });
    return map;
  }, [projects]);

  const results = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return projects.filter((p) => {
      const inCategory = filter === "All" || p.category === filter || p.tags.includes(filter);
      if (!inCategory) return false;
      if (!q) return true;
      return [p.title, p.tagline, p.description, p.category, ...p.tags, ...p.tech].join(" ").toLowerCase().includes(q);
    });
  }, [projects, filter, deferred]);

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-4 mb-10 px-4 py-3 md:static md:mx-0 md:px-0 md:py-0">
        <div className="glass flex flex-col gap-3 rounded-3xl p-3 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filter by category" className="flex gap-1.5 overflow-x-auto" data-lenis-prevent>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm transition", filter === f ? "text-bg" : "text-muted hover:text-fg")}
              >
                {filter === f && <span className="absolute inset-0 -z-10 rounded-full bg-white" />}
                {f}
                <span className={cn("ml-1.5 font-mono text-[10px]", filter === f ? "text-bg/60" : "text-zinc-400")}>{counts[f] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, stack…"
              className="h-10 w-full rounded-full border border-line bg-white/[0.03] pl-10 pr-10 text-sm outline-none placeholder:text-muted/60 focus:border-primary/60"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-fg" aria-label="Clear search">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {results.length} project{results.length === 1 ? "" : "s"} shown
      </p>

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((p) => (
            <m.li key={p.id} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <ProjectCard project={p} />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>

      {results.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-lg font-medium">No projects match that.</p>
          <p className="mt-2 text-sm text-muted">Try another category or clear the search.</p>
        </div>
      )}
    </div>
  );
}
