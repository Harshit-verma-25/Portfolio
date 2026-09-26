import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TeamTable } from "@/components/admin/team-table";
import { requireStaff } from "@/lib/auth";
import type { StaffProfile } from "@/types";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const { supabase, user } = await requireStaff("admin");
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Team"
        description="Everyone with an account. New accounts get no access until you assign a role. Add people in Supabase → Authentication → Users."
      />
      <TeamTable members={(data ?? []) as StaffProfile[]} currentUserId={user.id} />
    </div>
  );
}
