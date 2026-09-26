"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
    });
    if (error && error.code === "over_email_send_rate_limit") {
      setState("idle");
      setError("Too many emails requested. Wait a few minutes and try again.");
      return;
    }
    // Always show the same message so the form can't be used to discover accounts.
    setState("sent");
  };

  if (state === "sent") {
    return (
      <div className="glass space-y-4 rounded-3xl p-6 text-center" role="status">
        <MailCheck className="mx-auto size-8 text-accent" />
        <p className="text-sm">If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way. It expires in one hour.</p>
        <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-3xl p-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={state === "loading" || !email}>
        {state === "loading" && <Loader2 className="animate-spin" />} Send reset link
      </Button>
      <Link href="/admin/login" className="flex items-center justify-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      setError(error.code === "same_password" ? "Choose a password different from your current one." : error.message);
      return;
    }
    // Sign out everywhere so the recovery session can't be reused, then sign in fresh.
    await supabase.auth.signOut({ scope: "global" });
    window.location.assign("/admin/login?reset=1");
  };

  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-3xl p-6">
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2" />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-2" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading || !password || !confirm}>
        {loading && <Loader2 className="animate-spin" />} Update password
      </Button>
    </form>
  );
}
