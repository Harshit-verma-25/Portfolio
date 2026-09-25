"use client";

import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/supabase/env";
import type { MediaItem } from "@/types";

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const ACCEPTED = "image/*,video/mp4,video/webm,application/pdf";

/**
 * Uploads straight from the browser to Supabase Storage (so large videos never pass through a
 * serverless function), then records the file in the `media` table. Storage + table RLS both
 * require a staff session.
 */
export async function uploadMedia(file: File): Promise<MediaItem> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is larger than 50 MB`);
  const supabase = createClient();
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safe}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  const { data, error: insertError } = await supabase
    .from("media")
    .insert({ name: file.name, path, url: publicUrl, mime_type: file.type || "application/octet-stream", size: file.size })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return data as MediaItem;
}

export async function listMedia(kind?: "image" | "video" | "pdf"): Promise<MediaItem[]> {
  let query = createClient().from("media").select("*").order("created_at", { ascending: false }).limit(200);
  if (kind === "image") query = query.like("mime_type", "image/%");
  if (kind === "video") query = query.like("mime_type", "video/%");
  if (kind === "pdf") query = query.eq("mime_type", "application/pdf");
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MediaItem[];
}

export const formatBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`);
