/** Centered card layout shared by the login, forgot-password and reset-password pages. */
export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-16">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.22),transparent_55%)]" />
      <div aria-hidden className="grid-bg absolute inset-0 opacity-50" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent font-mono text-sm font-bold">HV</span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

export function Notice({ kind, children }: { kind: "error" | "info" | "success"; children: React.ReactNode }) {
  const styles = {
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    info: "border-accent/30 bg-accent/10 text-cyan-200",
    success: "border-success/30 bg-success/10 text-green-300",
  }[kind];
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </p>
  );
}
