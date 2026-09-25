import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import type { Testimonial } from "@/types";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null;
  return (
    <section aria-labelledby="testimonials-title" className="section">
      <div className="container-page">
        <SectionHeading id="testimonials-title" eyebrow="Kind words" title="People I've built with." align="center" />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <figure className="glass flex h-full flex-col rounded-3xl p-7 transition-colors hover:bg-white/[0.07]">
                <Quote className="size-6 text-primary" aria-hidden />
                <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-zinc-200">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                  <span aria-hidden className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold">
                    {t.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-muted">
                      {t.role === t.name ? t.company : `${t.role}, ${t.company}`}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
