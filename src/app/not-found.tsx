import Link from "next/link";
import { GeistSans } from "geist/font/sans";

export default function NotFound() {
  return (
    <main className={`${GeistSans.className} relative grid min-h-dvh place-items-center overflow-hidden px-6 text-center`}>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25),transparent_55%)]" />
      <div className="relative">
        <p className="font-mono text-sm text-accent">404 · lost in space</p>
        <h1 className="mt-4 text-[clamp(5rem,20vw,12rem)] font-bold leading-none tracking-tighter text-gradient">404</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">This page drifted out of orbit. Let&apos;s get you back to somewhere useful.</p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-bg">
            Back home
          </Link>
          <Link href="/projects" className="rounded-full border border-line px-6 py-3 text-sm">
            See projects
          </Link>
        </div>
      </div>
    </main>
  );
}
