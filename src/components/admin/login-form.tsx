"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next, disabled }: { next: string; disabled?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const safeNext = next.startsWith("/admin") ? next : "/admin";

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMessage({ kind: "error", text: error.message });
    router.replace(safeNext);
    router.refresh();
  };

  const magicLink = async () => {
    if (!email) return setMessage({ kind: "error", text: "Enter your email first." });
    setLoading(true);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`, shouldCreateUser: false },
    });
    setLoading(false);
    setMessage(error ? { kind: "error", text: error.message } : { kind: "info", text: "Check your inbox for a sign-in link." });
  };

  return (
    <form onSubmit={signIn} className="glass space-y-4 rounded-3xl p-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" disabled={disabled} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2" disabled={disabled} />
      </div>
      {message && (
        <p role={message.kind === "error" ? "alert" : "status"} className={message.kind === "error" ? "text-sm text-red-400" : "text-sm text-cyan-300"}>
          {message.text}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={loading || disabled || !password}>
        {loading && <Loader2 className="animate-spin" />} Sign in
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={magicLink} disabled={loading || disabled}>
        <Mail /> Email me a magic link
      </Button>
    </form>
  );
}
