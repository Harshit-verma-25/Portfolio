"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, Download, Sparkles } from "lucide-react";
import { HeroScene } from "@/components/three/lazy";
import { Magnetic } from "@/components/motion/magnetic";
import { TextReveal } from "@/components/motion/text-reveal";
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/layout/aurora";
import { useUI } from "@/store/ui";
import { usePrefersReducedMotion } from "@/hooks/use-media";
import { recordEvent, track } from "@/lib/analytics";
import type { Profile } from "@/types";

const ROLES = ["Full Stack Developer", "AI Product Engineer", "Creative Technologist", "Systems Thinker"];

function RotatingRole() {
  const [i, setI] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <span className="relative inline-grid h-[1.2em] overflow-hidden align-bottom" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={ROLES[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-gradient-brand col-start-1 row-start-1 whitespace-nowrap"
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const setHeroProgress = useUI((s) => s.setHeroProgress);
  const setChatOpen = useUI((s) => s.setChatOpen);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", setHeroProgress);

  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, -80]);
  const contentScale = useTransform(scrollYProgress, [0, 0.45], [1, 0.96]);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative h-[160vh] md:h-[200vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {reduced ? <Aurora /> : <HeroScene />}
        {/* legibility gradients */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(5,8,22,0.85),transparent_60%)] md:bg-[radial-gradient(ellipse_at_left,rgba(5,8,22,0.9),transparent_55%)]" />

        <motion.div style={{ opacity: contentOpacity, y: contentY, scale: contentScale }} className="container-page relative z-10 flex h-full flex-col justify-end pb-24 pt-32 md:justify-center md:pb-0">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-6 flex flex-wrap items-center gap-3">
            {profile.available_for_work && (
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-zinc-300">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                Available for new projects
              </span>
            )}
            <span className="font-mono text-xs text-muted">{profile.location}</span>
          </motion.div>

          <h1 id="hero-title" className="sr-only">
            {profile.name} — {profile.title}
          </h1>
          <TextReveal as="p" immediate text={profile.name} delay={0.3} className="text-[clamp(3.2rem,11vw,9.5rem)] font-semibold leading-[0.9] tracking-[-0.05em]" wordClassName="text-gradient" />
          <motion.p aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }} className="mt-4 text-[clamp(1.4rem,3.5vw,2.6rem)] font-medium tracking-tight text-zinc-200">
            <RotatingRole />
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }} className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            {profile.hero_text}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8 }} className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Button asChild size="lg" variant="brand">
                <Link href="/projects">
                  Explore my work <ArrowRight />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button size="lg" variant="outline" onClick={() => setChatOpen(true)}>
                <Sparkles /> Ask my AI
              </Button>
            </Magnetic>
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
          </motion.div>
        </motion.div>

        <motion.div aria-hidden style={{ opacity: contentOpacity }} className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-muted md:flex">
          <span className="font-mono uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown className="size-4 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
