"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { resources, type Field } from "@/lib/admin/resources";
import { LEAD_STATUSES } from "@/types";
import { slugify } from "@/lib/utils";

type Result = { ok: true; id?: string } | { ok: false; error: string };

/** Convert raw editor values (strings from inputs) into typed column values. */
function coerce(field: Field, raw: unknown): unknown {
  const str = typeof raw === "string" ? raw.trim() : raw;
  switch (field.type) {
    case "number":
      return str === "" || str == null ? null : Number(str);
    case "switch":
      return raw === true || raw === "true" || raw === "on";
    case "tags":
      return Array.isArray(raw) ? raw : String(str ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    case "lines":
      return Array.isArray(raw) ? raw : String(str ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    case "images":
      return Array.isArray(raw) ? raw.filter(Boolean) : [];
    case "json":
      if (str === "" || str == null) return null;
      return typeof str === "string" ? JSON.parse(str) : str;
    case "date":
    case "url":
    case "image":
    case "select":
      return str === "" || str == null ? null : str;
    default:
      return str ?? null;
  }
}

function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function saveRecord(resourceKey: string, id: string | null, values: Record<string, unknown>): Promise<Result> {
  const config = resources[resourceKey];
  if (!config) return { ok: false, error: "Unknown resource" };
  const { supabase } = await requireStaff("editor");

  const row: Record<string, unknown> = {};
  try {
    for (const field of config.fields) {
      const value = coerce(field, values[field.name]);
      if (field.required && (value === null || value === "" || (typeof value === "number" && Number.isNaN(value)))) {
        return { ok: false, error: `${field.label} is required` };
      }
      if (typeof value === "number" && Number.isNaN(value)) return { ok: false, error: `${field.label} must be a number` };
      row[field.name] = value;
    }
  } catch {
    return { ok: false, error: "Case study JSON is invalid" };
  }

  if (config.slugFrom && "slug" in row) row.slug = slugify(String(row.slug || row[config.slugFrom] || ""));
  if (resourceKey === "posts" && row.status === "published") {
    const existing = id ? await supabase.from("posts").select("published_at").eq("id", id).maybeSingle() : null;
    row.published_at = existing?.data?.published_at ?? new Date().toISOString();
  }
  if (resourceKey === "posts" && row.status === "draft") row.published_at = null;

  const query = id ? supabase.from(config.table).update(row).eq("id", id).select("id").single() : supabase.from(config.table).insert(row).select("id").single();
  const { data, error } = await query;
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  revalidatePath(`/admin/${resourceKey}`);
  return { ok: true, id: data.id };
}

export async function deleteRecord(resourceKey: string, id: string): Promise<Result> {
  const config = resources[resourceKey];
  if (!config) return { ok: false, error: "Unknown resource" };
  const { supabase } = await requireStaff("editor");
  const { error } = await supabase.from(config.table).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  revalidatePath(`/admin/${resourceKey}`);
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string(),
  hero_text: z.string(),
  bio: z.string(),
  location: z.string(),
  email: z.email(),
  avatar_url: z.string().min(1),
  resume_url: z.string().min(1),
  available_for_work: z.boolean(),
  socials: z.record(z.string(), z.string()),
  now_building: z.object({ company: z.string(), role: z.string(), summary: z.string(), items: z.array(z.string()) }),
});

export async function saveProfile(values: unknown): Promise<Result> {
  const { supabase } = await requireStaff("admin");
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile" };
  const { data: existing } = await supabase.from("profile").select("id").limit(1).maybeSingle();
  const { error } = existing ? await supabase.from("profile").update(parsed.data).eq("id", existing.id) : await supabase.from("profile").insert(parsed.data);
  if (error) return { ok: false, error: error.message };
  revalidateSite();
  return { ok: true };
}

export async function updateLeadStatus(id: string, status: string): Promise<Result> {
  const { supabase } = await requireStaff("admin");
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Invalid status" };
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteLead(id: string): Promise<Result> {
  const { supabase } = await requireStaff("admin");
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function deleteMedia(id: string, path: string): Promise<Result> {
  const { supabase } = await requireStaff("admin");
  const { error: storageError } = await supabase.storage.from("media").remove([path]);
  if (storageError) return { ok: false, error: storageError.message };
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/media");
  return { ok: true };
}
