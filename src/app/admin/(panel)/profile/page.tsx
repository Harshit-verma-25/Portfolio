import type { Metadata } from "next";
import { ProfileForm } from "@/components/admin/profile-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/lib/auth";
import { EMPTY_PROFILE } from "@/lib/content";
import type { Profile } from "@/types";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { supabase } = await requireStaff("admin");
  const { data, error } = await supabase.from("site_profile").select("*").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  const profile: Profile = { ...EMPTY_PROFILE, ...(data ?? {}) };
  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="Profile" description="Name, bio, hero copy, résumé, socials and the Now Building card." />
      {!data && <p className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-amber-200">No profile saved yet — fill this in and save to publish it.</p>}
      <ProfileForm profile={profile} />
    </div>
  );
}
