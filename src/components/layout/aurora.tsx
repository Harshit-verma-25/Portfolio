import { cn } from "@/lib/utils";

/** Animated aurora gradient blobs. Pure CSS — zero JS cost. */
export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} style={{ opacity: intensity }}>
      <div className="absolute -left-1/4 -top-1/4 size-[60vmax] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_60%)] blur-3xl" />
      <div className="absolute -right-1/4 top-0 size-[50vmax] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.3),transparent_60%)] blur-3xl [animation-delay:-6s]" />
      <div className="absolute bottom-[-30%] left-1/4 size-[55vmax] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.22),transparent_60%)] blur-3xl [animation-delay:-12s]" />
    </div>
  );
}
