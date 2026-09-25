import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { TextReveal } from "./text-reveal";

export function SectionHeading({ eyebrow, title, description, align = "left", className, id }: { eyebrow: string; title: string; description?: string; align?: "left" | "center"; className?: string; id?: string }) {
  return (
    <div className={cn("mb-14 max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Reveal>
        <p className="eyebrow mb-4">{eyebrow}</p>
      </Reveal>
      <TextReveal id={id} text={title} className="text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl" wordClassName="text-gradient" />
      {description && (
        <Reveal delay={0.15}>
          <p className="mt-6 text-lg leading-relaxed text-muted">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
