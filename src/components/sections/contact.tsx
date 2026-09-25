import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { siteConfig } from "@/lib/site";
import type { Profile } from "@/types";
import { ContactForm } from "./contact-form";
import { CalendlyEmbed } from "./calendly";

export function Contact({ profile, headingLevel = "h2" }: { profile: Profile; headingLevel?: "h1" | "h2" }) {
  const socials = [
    { href: `mailto:${profile.email}`, label: profile.email, icon: Mail },
    { href: profile.socials.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: profile.socials.github, label: "GitHub", icon: Github },
    { href: profile.socials.instagram, label: "Instagram", icon: Instagram },
  ].filter((s) => s.href);
  return (
    <section id="contact" aria-labelledby="contact-title" className="section">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          {headingLevel === "h1" ? (
            <div className="mb-14">
              <p className="eyebrow mb-4">Contact</p>
              <h1 id="contact-title" className="text-5xl font-semibold leading-[1.02] tracking-tight text-gradient md:text-7xl">
                Let&apos;s build what&apos;s next.
              </h1>
              <p className="mt-6 text-lg text-muted">Tell me about your product, role or idea. Every message gets a personal reply.</p>
            </div>
          ) : (
            <SectionHeading id="contact-title" eyebrow="Contact" title="Let's build what's next." description="Tell me about your product, role or idea. Every message gets a personal reply." />
          )}
          <ul className="space-y-3">
            {socials.map(({ href, label, icon: Icon }, i) => (
              <Reveal as="li" key={label} delay={i * 0.06}>
                <Magnetic strength={0.15}>
                  <a href={href} target={href!.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-2xl py-2 text-lg text-zinc-300 transition hover:text-fg">
                    <span className="grid size-11 place-items-center rounded-full border border-line transition group-hover:border-primary/60 group-hover:bg-primary/10">
                      <Icon className="size-4" />
                    </span>
                    {label}
                  </a>
                </Magnetic>
              </Reveal>
            ))}
          </ul>
          <div className="mt-10">
            <CalendlyEmbed url={siteConfig.calendly} />
          </div>
        </div>
        <Reveal>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
