"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { resources, type Field } from "@/lib/admin/resources";
import { LEAD_STATUSES, ROLES } from "@/types";
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

/** Postgres/PostgREST errors → messages an editor can act on. */
function friendly(error: { code?: string; message: string }) {
  if (error.code === "23505") return "Something with that slug already exists — choose another.";
  if (error.code === "42501" || /row-level security/i.test(error.message)) return "Your role isn't allowed to make this change.";
  if (error.code === "23514") return `A value is outside the allowed range (${error.message}).`;
  if (error.code === "PGRST301" || /JWT/i.test(error.message)) return "Your session has expired. Please sign in again.";
  return error.message;
}

function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function saveRecord(resourceKey: string, id: string | null, values: Record<string, unknown>): Promise<Result> {
  const config = resources[resourceKey];
  if (!config) return { ok: false, error: "Unknown resource" };
  const auth = await authorize(config.minRole);
  if (!auth.ok) return auth;
  const { supabase } = auth.staff;

  const row: Record<string, unknown> = {};
  for (const field of config.fields) {
    let value: unknown;
    try {
      value = coerce(field, values[field.name]);
    } catch {
      return { ok: false, error: `${field.label}: invalid JSON` };
    }
    if (typeof value === "number" && Number.isNaN(value)) return { ok: false, error: `${field.label} must be a number` };
    if (field.required && (value === null || value === "")) return { ok: false, error: `${field.label} is required` };
    // Let column defaults apply to optional numbers left empty.
    if (value === null && field.type === "number") continue;
    row[field.name] = value;
  }

  if (config.slugFrom) row.slug = slugify(String(row.slug || row[config.slugFrom] || ""));
  if (resourceKey === "posts") {
    if (row.status === "published") {
      const existing = id ? await supabase.from("posts").select("published_at").eq("id", id).maybeSingle() : null;
      row.published_at = existing?.data?.published_at ?? new Date().toISOString();
    } else {
      row.published_at = null;
    }
  }

  const { data, error } = id
    ? await supabase.from(config.table).update(row).eq("id", id).select("id").maybeSingle()
    : await supabase.from(config.table).insert(row).select("id").single();
  if (error) return { ok: false, error: friendly(error) };
  // An update that matches no row (deleted meanwhile, or blocked by RLS) returns no data.
  if (!data) return { ok: false, error: "Nothing was saved — the record no longer exists or you lack permission." };
  revalidateSite();
  revalidatePath(`/admin/${resourceKey}`);
  return { ok: true, id: data.id };
}

export async function deleteRecord(resourceKey: string, id: string): Promise<Result> {
  const config = resources[resourceKey];
  if (!config) return { ok: false, error: "Unknown resource" };
  const auth = await authorize(config.minRole);
  if (!auth.ok) return auth;
  const { data, error } = await auth.staff.supabase.from(config.table).delete().eq("id", id).select("id");
  if (error) return { ok: false, error: friendly(error) };
  if (!data?.length) return { ok: false, error: "Nothing was deleted — you may lack permission." };
  revalidateSite();
  revalidatePath(`/admin/${resourceKey}`);
  return { ok: true };
}

const siteProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().min(1, "Title is required"),
  tagline: z.string(),
  hero_text: z.string(),
  bio: z.string(),
  location: z.string(),
  email: z.email("Enter a valid public email"),
  avatar_url: z.string().min(1),
  resume_url: z.string().min(1),
  available_for_work: z.boolean(),
  socials: z.record(z.string(), z.string()),
  now_building: z.object({ company: z.string(), role: z.string(), summary: z.string(), items: z.array(z.string()) }),
});

export async function saveSiteProfile(values: unknown): Promise<Result> {
  const auth = await authorize("admin");
  if (!auth.ok) return auth;
  const { supabase } = auth.staff;
  const parsed = siteProfileSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile" };
  const { data: existing } = await supabase.from("site_profile").select("id").limit(1).maybeSingle();
  const { error } = existing ? await supabase.from("site_profile").update(parsed.data).eq("id", existing.id) : await supabase.from("site_profile").insert(parsed.data);
  if (error) return { ok: false, error: friendly(error) };
  revalidateSite();
  return { ok: true };
}

export async function updateLeadStatus(id: string, status: string): Promise<Result> {
  const auth = await authorize("editor");
  if (!auth.ok) return auth;
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Invalid status" };
  const { error } = await auth.staff.supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteLead(id: string): Promise<Result> {
  const auth = await authorize("admin");
  if (!auth.ok) return auth;
  const { error } = await auth.staff.supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function deleteMedia(id: string, path: string): Promise<Result> {
  const auth = await authorize("admin");
  if (!auth.ok) return auth;
  const { supabase } = auth.staff;
  const { error: storageError } = await supabase.storage.from("media").remove([path]);
  if (storageError) return { ok: false, error: storageError.message };
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function setUserRole(userId: string, role: string): Promise<Result> {
  const auth = await authorize("admin");
  if (!auth.ok) return auth;
  if (userId === auth.staff.user.id) return { ok: false, error: "You can't change your own role." };
  const next = role === "" ? null : role;
  if (next !== null && !(ROLES as readonly string[]).includes(next)) return { ok: false, error: "Invalid role" };
  const { error } = await auth.staff.supabase.from("profiles").update({ role: next }).eq("id", userId);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath("/admin/team");
  return { ok: true };
}
