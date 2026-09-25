import { Trophy } from "lucide-react";
import { SectionHeading } from "@/components/motion/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";
import type { Achievement, Certification } from "@/types";

export function Achievements({ achievements, certifications }: { achievements: Achievement[]; certifications: Certification[] }) {
  return (
    <section aria-labelledby="achievements-title" className="section">
      <div className="container-page">
        <SectionHeading id="achievements-title" eyebrow="Achievements" title="Milestones worth a trophy." />
        <Stagger className="grid gap-5 md:grid-cols-3">
          {achievements.map((a) => (
            <StaggerItem key={a.id}>
              <article className="group glass relative h-full overflow-hidden rounded-3xl p-7">
                <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-2xl transition-all duration-700 group-hover:bg-accent/25" />
                <Trophy className="size-5 text-warning" aria-hidden />
                {a.metric && <p className="mt-6 text-5xl font-semibold tracking-tight text-gradient">{a.metric}</p>}
                <h3 className="mt-4 text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a.description}</p>
                <p className="mt-5 font-mono text-xs text-zinc-400">{formatDate(a.date)}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
        {certifications.length > 0 && (
          <div className="mt-10">
            <h3 className="eyebrow mb-4">Certifications</h3>
            <ul className="grid gap-3 md:grid-cols-2">
              {certifications.map((c) => (
                <li key={c.id} className="glass flex items-center justify-between rounded-2xl px-5 py-4">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-muted">
                      {c.issuer} · {formatDate(c.issue_date)}
                    </p>
                  </div>
                  {c.credential_url && (
                    <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
                      Verify
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
