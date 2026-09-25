import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const loop = [...items, ...items];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <ul className="flex w-max shrink-0 animate-marquee gap-4 pr-4 hover:[animation-play-state:paused]" style={{ animationDirection: reverse ? "reverse" : "normal" }}>
        {loop.map((t, i) => (
          <li key={`${t}-${i}`} aria-hidden={i >= items.length} className="glass whitespace-nowrap rounded-2xl px-6 py-4 text-lg font-medium text-zinc-200">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TechStack({ stack }: { stack: Record<string, string[]> }) {
  const groups = Object.entries(stack);
  const all = groups.flatMap(([, v]) => v);
  const half = Math.ceil(all.length / 2);
  return (
    <section aria-labelledby="stack-title" className="section overflow-hidden">
      <div className="container-page">
        <SectionHeading id="stack-title" eyebrow="Tech stack" title="Sharp tools, used deliberately." align="center" />
      </div>
      <div className="space-y-4">
        <Row items={all.slice(0, half)} />
        <Row items={all.slice(half)} reverse />
      </div>
      <div className="container-page mt-14">
        <Reveal>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {groups.map(([group, items]) => (
              <div key={group} className="rounded-2xl border border-line p-5">
                <dt className="eyebrow">{group}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted">{items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
