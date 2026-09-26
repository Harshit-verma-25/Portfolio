import type { Metadata } from "next";
import { LeadsTable } from "@/components/admin/leads-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/lib/auth";
import type { Lead } from "@/types";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const { supabase, role } = await requireStaff();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (
    <div>
      <AdminPageHeader title="Contact leads" description="Every contact-form submission, with a simple pipeline: new → contacted → closed." />
      <LeadsTable leads={(data ?? []) as Lead[]} canDelete={role === "admin"} />
    </div>
  );
}
