import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeAdminPath } from "@/lib/supabase/env";

/**
 * Completes email-based auth flows (password recovery, invites, email change) and sets the
 * session cookie. Supports both link formats Supabase can send:
 *   - PKCE:      /auth/callback?code=…                       (default for @supabase/ssr)
 *   - token hash /auth/callback?token_hash=…&type=recovery   (custom email templates)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeAdminPath(url.searchParams.get("next"), type === "recovery" ? "/admin/reset-password" : "/admin");

  const supabase = await createClient();
  let error: { message: string } | null = null;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else {
    error = { message: "missing code" };
  }

  if (error) {
    console.warn("[auth/callback]", error.message);
    return NextResponse.redirect(new URL("/admin/login?error=link", url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
