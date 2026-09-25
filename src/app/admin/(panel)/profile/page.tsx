import type { Metadata } from "next";
import { ProfileForm } from "@/components/admin/profile-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireStaff } from "@/lib/auth";
import { profile as fallbackProfile } from "@/lib/data/content";
import type { Profile } from "@/types";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { supabase } = await requireStaff("admin");
  const { data } = await supabase.from("profile").select("*").limit(1).maybeSingle();
  const profile: Profile = { ...fallbackProfile, ...(data ?? {}) };
  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="Profile" description="Name, bio, hero copy, résumé, socials and the Now Building card." />
      <ProfileForm profile={profile} />
    </div>
  );
}
