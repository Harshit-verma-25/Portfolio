import { Reveal } from "@/components/motion/reveal";
import type { NowBuilding as NowBuildingType } from "@/types";

export function NowBuilding({ now }: { now: NowBuildingType }) {
  return (
    <section aria-labelledby="now-title" className="relative py-10">
      <div className="container-page">
        <Reveal>
          <div className="border-gradient glass relative overflow-hidden rounded-[2rem] p-8 md:p-12">
            <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
              <div>
                <p className="eyebrow mb-4 flex items-center gap-2">
                  <span className="size-2 animate-pulse-soft rounded-full bg-accent" /> Now building
                </p>
                <h2 id="now-title" className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {now.role} at <span className="text-gradient-brand">{now.company}</span>
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-muted">{now.summary}</p>
              </div>
              <ul className="grid gap-3">
                {now.items.map((item, i) => (
                  <li key={item} className="flex items-center gap-4 rounded-2xl border border-line bg-white/[0.03] px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
