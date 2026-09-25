import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({ event: z.enum(["resume_download", "project_view"]), ref: z.string().max(120).optional() });

/** First-party event counter (resume downloads, project views) for the admin dashboard. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`events:${ip}`, 60, 60_000)) return new Response(null, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const supabase = createServiceClient();
  if (supabase) {
    await supabase.from("events").insert({ type: parsed.data.event, ref: parsed.data.ref ?? null, path: req.headers.get("referer") });
  }
  return new Response(null, { status: 204 });
}
