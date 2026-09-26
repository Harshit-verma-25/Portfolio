"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Word-by-word masked reveal. The full sentence stays in the DOM as a single accessible
 * string (aria-label) while the animated spans are hidden from assistive tech.
 */
export function TextReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  as: Tag = "h2",
  immediate = false,
  id,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  immediate?: boolean;
  id?: string;
}) {
  const words = text.split(" ");
  const MotionTag = m[Tag];
  return (
    <MotionTag
      id={id}
      aria-label={text}
      className={className}
      initial="hidden"
      {...(immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-10% 0px" } })}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: delay } } }}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <m.span
            className={cn("inline-block", wordClassName)}
            variants={{ hidden: { y: "110%", rotate: 4 }, show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </m.span>
        </span>
      ))}
    </MotionTag>
  );
}
