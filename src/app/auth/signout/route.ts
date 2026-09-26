import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Server-side sign-out: revokes the refresh token and clears the auth cookies. */
export async function POST(request: Request) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/admin/login?signed_out=1", request.url), { status: 303 });
}
