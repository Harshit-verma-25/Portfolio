import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  unauthorized: "Your account doesn't have admin access.",
  "not-configured": "Supabase isn't configured. Add the environment variables from .env.example.",
  auth: "Sign-in link was invalid or expired.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.25),transparent_55%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent font-mono text-sm font-bold">HV</span>
          <h1 className="mt-5 text-2xl font-semibold">Portfolio admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage content.</p>
        </div>
        {error && ERRORS[error] && (
          <p role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {ERRORS[error]}
          </p>
        )}
        <LoginForm next={next ?? "/admin"} disabled={!isSupabaseConfigured} />
      </div>
    </main>
  );
}
