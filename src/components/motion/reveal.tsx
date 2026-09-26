"use client";

import { m, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

export function Reveal({ children, className, delay = 0, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" }) {
  const Comp = m[as];
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }} variants={item} transition={{ delay }}>
      {children}
    </Comp>
  );
}

export function Stagger({ children, className, stagger = 0.08 }: { children: React.ReactNode; className?: string; stagger?: number }) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <m.div className={cn(className)} variants={item}>
      {children}
    </m.div>
  );
}
