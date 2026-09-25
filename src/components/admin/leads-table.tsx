"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Mail, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/types";
import { deleteLead, updateLeadStatus } from "@/app/admin/actions";

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-accent/15 text-cyan-300 border-accent/30",
  contacted: "bg-warning/15 text-amber-300 border-warning/30",
  closed: "bg-white/5 text-zinc-400 border-line",
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => Object.fromEntries(LEAD_STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length])), [leads]);
  const visible = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Failed");
      router.refresh();
    });

  return (
    <div>
      <div role="group" aria-label="Filter leads by status" className="mb-5 flex flex-wrap gap-2">
        {(["all", ...LEAD_STATUSES] as const).map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={cn("rounded-full border px-3 py-1.5 text-sm capitalize", filter === s ? "border-white bg-white text-bg" : "border-line text-muted hover:text-fg")}>
            {s} <span className="ml-1 font-mono text-xs opacity-60">{s === "all" ? leads.length : counts[s]}</span>
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          {error}
        </p>
      )}
      <ul className="space-y-3">
        {visible.map((lead) => {
          const expanded = open === lead.id;
          return (
            <li key={lead.id} className="glass overflow-hidden rounded-2xl">
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <button type="button" onClick={() => setOpen(expanded ? null : lead.id)} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <ChevronDown className={cn("size-4 shrink-0 text-muted transition", expanded && "rotate-180")} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {lead.name} <span className="font-normal text-muted">· {lead.subject}</span>
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {lead.email} · {new Date(lead.created_at).toLocaleString()}
                      {lead.budget && ` · ${lead.budget}`}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-2 pl-7 md:pl-0">
                  <label className="sr-only" htmlFor={`status-${lead.id}`}>
                    Status for {lead.name}
                  </label>
                  <select
                    id={`status-${lead.id}`}
                    value={lead.status}
                    disabled={pending}
                    onChange={(e) => act(() => updateLeadStatus(lead.id, e.target.value))}
                    className={cn("rounded-full border px-3 py-1 text-xs capitalize outline-none", STATUS_STYLE[lead.status])}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-bg text-fg">
                        {s}
                      </option>
                    ))}
                  </select>
                  <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.subject}`)}`} className="rounded-lg p-2 text-muted hover:bg-white/10 hover:text-fg" aria-label={`Reply to ${lead.name}`}>
                    <Mail className="size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => window.confirm(`Delete the lead from ${lead.name}?`) && act(() => deleteLead(lead.id))}
                    className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Delete lead from ${lead.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {expanded && <p className="whitespace-pre-wrap border-t border-line px-4 py-4 pl-11 text-sm leading-relaxed text-zinc-300">{lead.message}</p>}
            </li>
          );
        })}
        {visible.length === 0 && <li className="py-12 text-center text-sm text-muted">No leads here.</li>}
      </ul>
    </div>
  );
}
