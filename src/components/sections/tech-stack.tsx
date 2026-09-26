import { SectionHeading } from "@/components/motion/section-heading";
import type { Skill } from "@/types";

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const loop = [...items, ...items];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <ul className="flex w-max shrink-0 animate-marquee gap-3 pr-3 hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ animationDirection: reverse ? "reverse" : "normal" }}>
        {loop.map((t, i) => (
          <li key={`${t}-${i}`} aria-hidden={i >= items.length} className="glass whitespace-nowrap rounded-2xl px-6 py-3.5 text-base font-medium text-zinc-200 transition-colors hover:text-white">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Marquee of every technology in the skills table. CSS-only animation. */
export function TechStack({ skills }: { skills: Skill[] }) {
  const names = [...new Set(skills.map((s) => s.name))];
  if (names.length < 4) return null;
  const half = Math.ceil(names.length / 2);
  return (
    <section aria-labelledby="stack-title" className="section overflow-hidden">
      <div className="container-page">
        <SectionHeading id="stack-title" eyebrow="Tech stack" title="The toolkit, at a glance." align="center" />
      </div>
      <div className="space-y-3">
        <Row items={names.slice(0, half)} />
        <Row items={names.slice(half)} reverse />
      </div>
    </section>
  );
}
