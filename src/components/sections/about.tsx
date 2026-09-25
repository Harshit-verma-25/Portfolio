import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import type { Profile } from "@/types";

const PRINCIPLES = [
  { k: "01", title: "Product first", body: "Understand the problem and the user before choosing the stack." },
  { k: "02", title: "Performance is a feature", body: "Budgets, measurement and green Core Web Vitals from day one." },
  { k: "03", title: "Accessible by default", body: "Keyboard, screen readers and reduced motion are not afterthoughts." },
];

export function About({ profile }: { profile: Profile }) {
  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="container-page grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
        <Reveal className="relative">
          <div className="border-gradient relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-[2rem] md:max-w-none">
            <Image src={profile.avatar_url} alt={`Portrait of ${profile.name}`} fill sizes="(max-width: 768px) 90vw, 40vw" className="object-cover grayscale-[20%] transition duration-700 hover:grayscale-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
                <MapPin className="size-3.5" /> {profile.location}
              </span>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col justify-center">
          <Reveal>
            <p className="eyebrow mb-4">About</p>
          </Reveal>
          <TextReveal id="about-title" text="I turn ambiguous ideas into fast, elegant, dependable software." className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl" wordClassName="text-gradient" />
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg leading-relaxed text-muted">{profile.bio}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.k} delay={0.1 + i * 0.08}>
                <div className="glass h-full rounded-2xl p-5">
                  <span className="font-mono text-xs text-accent">{p.k}</span>
                  <h3 className="mt-3 font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <Link href="/about" className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-fg underline-offset-8 hover:underline">
              The full story <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
