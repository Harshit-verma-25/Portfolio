import Link from "next/link";
import { ArrowUpRight, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { navItems } from "@/lib/site";
import type { Profile } from "@/types";

export function Footer({ profile }: { profile: Profile }) {
  const socials = [
    { href: profile.socials.github, label: "GitHub", icon: Github },
    { href: profile.socials.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: profile.socials.instagram, label: "Instagram", icon: Instagram },
    { href: `mailto:${profile.email}`, label: "Email", icon: Mail },
  ].filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden border-t border-line pb-10 pt-20">
      <div className="container-page">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              Let&apos;s build something <span className="text-gradient-brand">remarkable</span>.
            </p>
            <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg">
              Start a project <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <nav aria-label="Footer">
            <p className="eyebrow mb-4">Navigate</p>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="eyebrow mb-4">Elsewhere</p>
            <ul className="space-y-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a href={href} target={href!.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg">
                    <Icon className="size-4" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p aria-hidden className="pointer-events-none mt-20 select-none bg-gradient-to-b from-white/[0.12] to-transparent bg-clip-text text-center text-[18vw] font-bold leading-none tracking-tighter text-transparent">
          HARSHIT
        </p>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {profile.name}. Crafted with Next.js, Three.js & care.</p>
          <p className="font-mono">{profile.location}</p>
        </div>
      </div>
    </footer>
  );
}
