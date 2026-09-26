import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell, Notice } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured, safeAdminPath } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, { kind: "error" | "info" | "success"; text: string }> = {
  unauthorized: { kind: "error", text: "This account doesn't have dashboard access. Ask an admin to grant you a role." },
  "not-configured": { kind: "error", text: "Supabase isn't configured on this deployment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
  link: { kind: "error", text: "That link is invalid or has expired. Request a new one." },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string; signed_out?: string; reset?: string }> }) {
  const params = await searchParams;
  const session = await getSession();

  // Already signed in with a role → straight to the dashboard (no login loop for staff).
  if (session?.role) redirect(safeAdminPath(params.next));

  const message = params.error
    ? MESSAGES[params.error]
    : params.reset
      ? { kind: "success" as const, text: "Password updated. Sign in with your new password." }
      : params.signed_out
        ? { kind: "info" as const, text: "You've been signed out." }
        : null;

  return (
    <AuthShell title="Portfolio admin" description="Sign in to manage your content.">
      {message && <Notice kind={message.kind}>{message.text}</Notice>}
      {session && !session.role ? (
        <div className="glass space-y-4 rounded-3xl p-6 text-sm">
          <p>
            Signed in as <span className="font-medium">{session.user.email}</span>, but this account has no role yet.
          </p>
          <form action="/auth/signout" method="post">
            <button type="submit" className="h-10 w-full rounded-full border border-line-strong text-sm hover:bg-white/5">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <LoginForm next={safeAdminPath(params.next)} disabled={!isSupabaseConfigured} />
      )}
    </AuthShell>
  );
}
