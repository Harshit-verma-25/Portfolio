import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { ResetPasswordForm } from "@/components/admin/password-forms";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Reached from the recovery email via /auth/callback, which signs the user in first. */
export default async function ResetPasswordPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login?error=link");
  return (
    <AuthShell title="Choose a new password" description={`For ${session.user.email}`}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
