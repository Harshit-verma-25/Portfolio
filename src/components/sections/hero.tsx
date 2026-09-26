"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { useUI } from "@/store/ui";
import { usePrefersReducedMotion } from "@/hooks/use-media";
import { recordEvent, track } from "@/lib/analytics";
import type { Profile } from "@/types";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Types, pauses, deletes and cycles through roles. Static text under reduced motion. */
function TypedRole({ roles }: { roles: string[] }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced || roles.length === 0) return;
    const full = roles[index % roles.length];
    const done = !deleting && text === full;
    const cleared = deleting && text === "";
    const delay = done ? 1800 : cleared ? 250 : deleting ? 35 : 70;
    const id = setTimeout(() => {
      if (done) setDeleting(true);
      else if (cleared) {
        setDeleting(false);
        setIndex((i) => i + 1);
      } else setText(full.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(id);
  }, [text, deleting, index, roles, reduced]);

  return (
    <span className="text-gradient-brand">
      {reduced ? roles[0] : text}
      <span aria-hidden className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-pulse-soft rounded-full bg-accent" />
    </span>
  );
}

/** Decorative "status" card beside the headline on large screens. Floats with a CSS animation. */
function NowCard({ now }: { now: Profile["now_building"] }) {
  return (
    <m.aside
      aria-label="Currently building"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.9, ease: EASE }}
      className="absolute right-[clamp(1rem,4vw,2rem)] top-1/2 hidden w-80 -translate-y-1/2 min-[1400px]:block"
    >
      <div className="border-gradient glass animate-float rounded-3xl p-6 shadow-[0_40px_80px_-30px_rgba(99,102,241,0.55)]">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          <span className="size-1.5 animate-pulse-soft rounded-full bg-accent" /> Now building
        </p>
        <p className="mt-4 text-lg font-semibold leading-snug">{now.role}</p>
        <p className="text-sm text-muted">@ {now.company}</p>
        <ul className="mt-5 space-y-2.5">
          {now.items.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-2.5 text-[13px] leading-snug text-zinc-300">
              <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-zinc-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </m.aside>
  );
}

export function Hero({ profile }: { profile: Profile }) {
  const setChatOpen = useUI((s) => s.setChatOpen);
  const words = profile.name.split(" ");
  const roles = [profile.title, "AI Product Engineer", "Next.js Specialist", "Systems Thinker"].filter(Boolean);

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-32">
      {/* Background: aurora + grid + glow. Pure CSS, GPU-composited, zero JS. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute left-1/2 top-[-20%] h-[70vmax] w-[70vmax] -translate-x-1/2 animate-aurora rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,102,241,0.35),rgba(139,92,246,0.25),rgba(6,182,212,0.25),rgba(99,102,241,0.35))] opacity-60 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="container-page relative">
        {profile.now_building.company && <NowCard now={profile.now_building} />}
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mb-8 flex flex-wrap items-center gap-3">
          {profile.available_for_work && (
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-zinc-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Available for new projects
            </span>
          )}
          {profile.location && <span className="font-mono text-xs text-muted">{profile.location}</span>}
        </m.div>

        <h1 id="hero-title" className="text-[clamp(3rem,11vw,9rem)] font-semibold leading-[0.92] tracking-[-0.055em]">
          <span className="sr-only">
            {profile.name} — {profile.title}
          </span>
          <span aria-hidden className="block">
            {words.map((word, i) => (
              <span key={word + i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <m.span
                  className="text-gradient inline-block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.1 + i * 0.12, ease: EASE }}
                >
                  {word}
                  {i < words.length - 1 && " "}
                </m.span>
              </span>
            ))}
          </span>
        </h1>

        <m.p
          aria-hidden
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          className="mt-5 min-h-[1.3em] text-[clamp(1.4rem,3.4vw,2.5rem)] font-medium tracking-tight text-zinc-200"
        >
          <TypedRole roles={roles} />
        </m.p>

        {profile.hero_text && (
          <m.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: EASE }} className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            {profile.hero_text}
          </m.p>
        )}

        <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.75, ease: EASE }} className="mt-10 flex flex-wrap items-center gap-3">
          <Magnetic>
            <Button asChild size="lg" variant="brand">
              <Link href="/projects">
                Explore my work <ArrowRight />
              </Link>
            </Button>
          </Magnetic>
          <Button size="lg" variant="outline" onClick={() => setChatOpen(true)}>
            <Sparkles /> Ask my AI
          </Button>
          {profile.resume_url && (
            <Button asChild size="lg" variant="ghost">
              <a
                href={profile.resume_url}
                download
                onClick={() => {
                  track("resume_downloaded", { source: "hero" });
                  recordEvent("resume_download", "hero");
                }}
              >
                <Download /> Résumé
              </a>
            </Button>
          )}
        </m.div>
      </div>
    </section>
  );
}
