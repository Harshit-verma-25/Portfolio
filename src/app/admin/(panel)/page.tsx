import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Download, Eye, Inbox, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DailyChart } from "@/components/admin/daily-chart";
import { requireStaff } from "@/lib/auth";
import { getDashboardData } from "@/lib/admin/analytics";

export const metadata: Metadata = { title: "Analytics" };

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Users; label: string; value: string; hint?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
        <Icon className="size-3.5" aria-hidden /> {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Ranked({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="glass rounded-2xl p-5" aria-labelledby={`rank-${title}`}>
      <h2 id={`rank-${title}`} className="text-sm font-semibold">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{empty}</p>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <li key={r.label} className="relative flex items-center justify-between gap-4 overflow-hidden rounded-lg px-3 py-2 text-sm">
              <span aria-hidden className="absolute inset-y-0 left-0 rounded-lg bg-white/[0.05]" style={{ width: `${(r.value / max) * 100}%` }} />
              <span className="relative truncate font-mono text-xs text-zinc-200">{r.label}</span>
              <span className="relative font-mono text-xs text-zinc-300">{r.value.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase, role } = await requireStaff();
  const data = await getDashboardData(supabase);
  const n = (v: number | null) => (v === null ? "—" : v.toLocaleString());

  return (
    <div>
      <AdminPageHeader title="Analytics" description="Last 30 days · visitors via PostHog, conversions from first-party events." />
      {error === "forbidden" && (
        <p role="alert" className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-amber-200">
          That section requires the admin role.
        </p>
      )}
      {!data.posthogConfigured && (
        <p className="mb-6 flex items-start gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-muted">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          Visitor numbers need <code className="font-mono text-xs">POSTHOG_PERSONAL_API_KEY</code> and <code className="font-mono text-xs">POSTHOG_PROJECT_ID</code>. The chart below shows first-party events
          (project views + résumé downloads) until then.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Visitors" value={n(data.visitors)} hint={data.pageviews !== null ? `${data.pageviews.toLocaleString()} pageviews` : "PostHog not connected"} />
        <Stat icon={Inbox} label="Contact submissions" value={data.leads.last30.toLocaleString()} hint={`${data.leads.new} new · ${data.leads.total} all-time`} />
        <Stat icon={Download} label="Résumé downloads" value={data.resumeDownloads.toLocaleString()} />
        <Stat icon={Eye} label="Project views" value={data.projectViews.toLocaleString()} />
      </div>

      <section className="glass mt-6 rounded-2xl p-5" aria-labelledby="daily-title">
        <h2 id="daily-title" className="text-sm font-semibold">
          {data.dailySource === "posthog" ? "Daily visitors" : "Daily first-party events"}
        </h2>
        <div className="mt-4">
          <DailyChart data={data.daily} label={data.dailySource === "posthog" ? "Visitors" : "Events"} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Ranked title="Top pages" rows={data.topPages} empty="Connect PostHog to see top pages." />
        <Ranked title="Top projects" rows={data.topProjects} empty="No project views recorded yet." />
      </div>

      {role === "admin" && data.leads.new > 0 && (
        <Link href="/admin/leads" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-bg">
          <Inbox className="size-4" /> {data.leads.new} new lead{data.leads.new === 1 ? "" : "s"} waiting
        </Link>
      )}
    </div>
  );
}
