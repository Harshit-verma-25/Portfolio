import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { ForgotPasswordForm } from "@/components/admin/password-forms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" description="We'll email you a secure link to choose a new one.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
