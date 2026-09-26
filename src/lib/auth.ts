import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Role } from "@/types";

/**
 * Resolves the signed-in user and their role from `public.profiles`.
 *
 *  - admin  → everything
 *  - editor → dashboard, testimonials, certifications, achievements, lead statuses
 *  - null   → signed in but no dashboard access
 *
 * RLS enforces the same rules in the database; these checks keep the UI honest.
 * `getUser()` validates the JWT with Supabase Auth (unlike `getSession()`), so an expired or
 * revoked session is treated as signed out.
 */
export const getSession = cache(async () => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { user, role: (profile?.role ?? null) as Role | null, supabase };
});

export type Staff = NonNullable<Awaited<ReturnType<typeof getSession>>> & { role: Role };

export async function requireStaff(minRole: Role = "editor"): Promise<Staff> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!session.role) redirect("/admin/login?error=unauthorized");
  if (minRole === "admin" && session.role !== "admin") redirect("/admin?error=forbidden");
  return session as Staff;
}

/** For server actions: returns an error message instead of redirecting. */
export async function authorize(minRole: Role = "editor"): Promise<{ ok: true; staff: Staff } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Your session has expired. Please sign in again." };
  if (!session.role) return { ok: false, error: "Your account doesn't have dashboard access." };
  if (minRole === "admin" && session.role !== "admin") return { ok: false, error: "Only admins can do that." };
  return { ok: true, staff: session as Staff };
}
