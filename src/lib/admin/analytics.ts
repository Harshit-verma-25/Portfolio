import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export interface DailyPoint {
  day: string;
  value: number;
}

export interface DashboardData {
  posthogConfigured: boolean;
  visitors: number | null;
  pageviews: number | null;
  daily: DailyPoint[];
  dailySource: "posthog" | "first-party";
  topPages: { label: string; value: number }[];
  topProjects: { label: string; value: number }[];
  leads: { total: number; new: number; last30: number };
  resumeDownloads: number;
  projectViews: number;
}

const DAYS = 30;

async function hogql<T = unknown[]>(query: string): Promise<T[] | null> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const project = process.env.POSTHOG_PROJECT_ID;
  if (!key || !project) return null;
  const host = process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";
  try {
    const res = await fetch(`${host}/api/projects/${project}/query/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error(`PostHog ${res.status}`);
    const json = (await res.json()) as { results: T[] };
    return json.results;
  } catch (err) {
    console.warn("[analytics] PostHog query failed:", (err as Error).message);
    return null;
  }
}

/** Fill every day in the window so the chart has no silent gaps. */
function fillDays(points: Map<string, number>): DailyPoint[] {
  const out: DailyPoint[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, value: points.get(key) ?? 0 });
  }
  return out;
}

export async function getDashboardData(supabase: SupabaseClient): Promise<DashboardData> {
  const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();

  const [dailyPh, totalsPh, pagesPh, leadsTotal, leadsNew, leads30, events] = await Promise.all([
    hogql<[string, number]>(`SELECT toDate(timestamp) AS day, count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL ${DAYS} DAY GROUP BY day ORDER BY day`),
    hogql<[number, number]>(`SELECT count(DISTINCT person_id), count() FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL ${DAYS} DAY`),
    hogql<[string, number]>(`SELECT properties.$pathname AS path, count() AS views FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL ${DAYS} DAY GROUP BY path ORDER BY views DESC LIMIT 8`),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("events").select("type, ref, created_at").gte("created_at", since).limit(10000),
  ]);

  const rows = (events.data ?? []) as { type: string; ref: string | null; created_at: string }[];
  const projectCounts = new Map<string, number>();
  const firstPartyDaily = new Map<string, number>();
  let resumeDownloads = 0;
  let projectViews = 0;
  for (const e of rows) {
    if (e.type === "resume_download") resumeDownloads++;
    if (e.type === "project_view") {
      projectViews++;
      if (e.ref) projectCounts.set(e.ref, (projectCounts.get(e.ref) ?? 0) + 1);
    }
    const day = e.created_at.slice(0, 10);
    firstPartyDaily.set(day, (firstPartyDaily.get(day) ?? 0) + 1);
  }

  const posthogConfigured = dailyPh !== null;
  return {
    posthogConfigured,
    visitors: totalsPh?.[0]?.[0] ?? null,
    pageviews: totalsPh?.[0]?.[1] ?? null,
    daily: fillDays(posthogConfigured ? new Map(dailyPh!.map(([d, v]) => [String(d).slice(0, 10), Number(v)])) : firstPartyDaily),
    dailySource: posthogConfigured ? "posthog" : "first-party",
    topPages: (pagesPh ?? []).map(([label, value]) => ({ label: label || "/", value: Number(value) })),
    topProjects: [...projectCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value })),
    leads: { total: leadsTotal.count ?? 0, new: leadsNew.count ?? 0, last30: leads30.count ?? 0 },
    resumeDownloads,
    projectViews,
  };
}
