"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  ExternalLink,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  LogOut,
  Menu,
  MessageSquareQuote,
  ScrollText,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/lib/auth";

const NAV: { href: string; label: string; icon: typeof BarChart3; adminOnly?: boolean }[] = [
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/admin/profile", label: "Profile", icon: UserRound, adminOnly: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experiences", label: "Experience", icon: Briefcase },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/certifications", label: "Certifications", icon: ScrollText },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/achievements", label: "Achievements", icon: Award },
  { href: "/admin/posts", label: "Blog", icon: BookOpen },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/leads", label: "Leads", icon: Inbox, adminOnly: true },
];

export function AdminSidebar({ email, role }: { email: string; role: AdminRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
      {NAV.filter((n) => !n.adminOnly || role === "admin").map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "bg-white/[0.08] text-fg" : "text-muted hover:bg-white/[0.04] hover:text-fg")}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-3 border-t border-line pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-2 px-3 text-sm text-muted hover:text-fg">
        <ExternalLink className="size-4" /> View site
      </Link>
      <div className="px-3">
        <p className="truncate text-xs text-zinc-300">{email}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">{role}</p>
      </div>
      <form action="/auth/signout" method="post">
        <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-white/[0.04] hover:text-fg">
          <LogOut className="size-4" /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur md:hidden">
        <span className="font-semibold">Admin</span>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-white/10" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-30 flex flex-col gap-4 bg-bg px-4 pb-6 pt-20 md:hidden">
          {nav}
          {footer}
        </div>
      )}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-line p-5 md:flex">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent font-mono text-xs font-bold">HV</span>
          <span className="font-semibold">Portfolio CMS</span>
        </Link>
        {nav}
        {footer}
      </aside>
    </>
  );
}
