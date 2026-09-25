import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media-library";
import { requireStaff } from "@/lib/auth";
import type { MediaItem } from "@/types";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const { supabase, role } = await requireStaff();
  const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
  return <MediaLibrary items={(data ?? []) as MediaItem[]} canDelete={role === "admin"} />;
}
