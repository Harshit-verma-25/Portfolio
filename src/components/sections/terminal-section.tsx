import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Terminal, type TerminalData } from "@/components/terminal/terminal";

export function TerminalSection({ data }: { data: TerminalData }) {
  return (
    <section aria-labelledby="terminal-title" className="section">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <SectionHeading id="terminal-title" eyebrow="For the curious" title="Prefer a shell?" description="Explore the whole portfolio from a terminal. Try `help`, `projects`, `open quyl` or `ask what stack do you use?`. Press ` or Ctrl+K anywhere to open it." className="mb-0" />
        </div>
        <Reveal>
          <Terminal data={data} className="h-[420px]" />
        </Reveal>
      </div>
    </section>
  );
}
