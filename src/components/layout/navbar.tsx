"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, Sparkles, SquareTerminal, X } from "lucide-react";
import { navItems } from "@/lib/site";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/magnetic";

export function Navbar() {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen, setChatOpen, setTerminalOpen } = useUI();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 400 && !menuOpen);
    setScrolled(y > 24);
  });

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, setMenuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          aria-label="Primary"
          className={cn(
            "flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-3 py-2 transition-all duration-500",
            scrolled || menuOpen ? "glass shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]" : "border border-transparent",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5 rounded-full pl-2 pr-3" aria-label="Harshit Verma — home">
            <span className="relative grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent font-mono text-xs font-bold">
              HV
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">Harshit Verma</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn("relative rounded-full px-4 py-2 text-sm transition-colors", isActive(item.href) ? "text-fg" : "text-muted hover:text-fg")}
                >
                  {isActive(item.href) && (
                    <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-white/[0.08]" transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                  )}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTerminalOpen(true)}
              className="hidden size-9 place-items-center rounded-full text-muted transition hover:bg-white/10 hover:text-fg sm:grid"
              aria-label="Open interactive terminal"
            >
              <SquareTerminal className="size-4" />
            </button>
            <Magnetic>
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-bg transition hover:bg-white/90"
              >
                <Sparkles className="size-3.5" />
                <span>Ask AI</span>
              </button>
            </Magnetic>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid size-9 place-items-center rounded-full text-fg transition hover:bg-white/10 md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-bg/95 px-6 pb-10 pt-28 backdrop-blur-2xl md:hidden"
          >
            <ul className="flex flex-1 flex-col gap-2">
              {navItems.map((item, i) => (
                <motion.li key={item.href} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}>
                  <Link
                    href={item.href}
                    className={cn("flex items-baseline gap-4 py-2 text-5xl font-semibold tracking-tight", isActive(item.href) ? "text-fg" : "text-zinc-400")}
                  >
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setMenuOpen(false); setTerminalOpen(true); }} className="glass flex h-14 items-center justify-center gap-2 rounded-2xl text-sm">
                <SquareTerminal className="size-4" /> Terminal
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); setChatOpen(true); }} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-medium text-bg">
                <Sparkles className="size-4" /> Ask AI
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
