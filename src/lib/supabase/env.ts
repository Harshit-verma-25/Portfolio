// Trim defensively: a stray space or newline pasted into an env var breaks JWT validation.
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const STORAGE_BUCKET = "media";

/** Only allow redirects back into the admin area (prevents open redirects via ?next=). */
export function safeAdminPath(next: string | null | undefined, fallback = "/admin") {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : fallback;
}
