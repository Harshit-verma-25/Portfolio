"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FRIENDLY: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Confirm your email address first — check your inbox.",
  over_request_rate_limit: "Too many attempts. Wait a minute and try again.",
  user_banned: "This account is disabled.",
};

export function LoginForm({ next, disabled }: { next: string; disabled?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      setError(FRIENDLY[error.code ?? ""] ?? error.message);
      return;
    }
    // Full navigation so the server sees the fresh auth cookies on the very first request.
    window.location.assign(next);
  };

  return (
    <form onSubmit={signIn} className="glass space-y-4 rounded-3xl p-6" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" disabled={disabled} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/admin/forgot-password" className="text-xs text-muted hover:text-fg">
            Forgot password?
          </Link>
        </div>
        <div className="relative mt-2">
          <Input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-11"
            disabled={disabled}
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:text-fg" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading || disabled || !email || !password}>
        {loading && <Loader2 className="animate-spin" />} Sign in
      </Button>
    </form>
  );
}
