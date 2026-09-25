import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceManager } from "@/components/admin/resource-manager";
import { resources } from "@/lib/admin/resources";
import { requireStaff } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }): Promise<Metadata> {
  const { resource } = await params;
  return { title: resources[resource]?.title ?? "Not found" };
}

export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const config = resources[resource];
  if (!config) notFound();
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from(config.table).select("*").order(config.orderBy.column, { ascending: config.orderBy.ascending });
  if (error) throw new Error(error.message);
  return <ResourceManager resourceKey={resource} rows={data ?? []} />;
}
