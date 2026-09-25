import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminRole = "admin" | "editor";

/**
 * Resolves the signed-in staff member. Roles live in `admin_users` (see migrations):
 *  - admin  → everything, including leads, analytics, media deletion and profile
 *  - editor → content CRUD only
 * RLS enforces the same rules in the database, so this is defence in depth.
 */
export async function getStaff() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!data) return null;
  return { user, role: data.role as AdminRole, supabase };
}

export async function requireStaff(minRole: AdminRole = "editor") {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login?error=unauthorized");
  if (minRole === "admin" && staff.role !== "admin") redirect("/admin?error=forbidden");
  return staff;
}
