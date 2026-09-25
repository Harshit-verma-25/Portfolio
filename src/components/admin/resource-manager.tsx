"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { resources } from "@/lib/admin/resources";
import { deleteRecord } from "@/app/admin/actions";
import { AdminPageHeader } from "./page-header";
import { RecordForm, type Row } from "./record-form";

function Cell({ value }: { value: unknown }) {
  if (typeof value === "boolean") return value ? <Check className="size-4 text-success" aria-label="Yes" /> : <span className="text-muted">—</span>;
  if (value === null || value === undefined || value === "") return <span className="text-muted">—</span>;
  if (value === "published") return <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-green-300">published</span>;
  if (value === "draft") return <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs text-amber-300">draft</span>;
  const s = String(value);
  return <span className="line-clamp-1">{/^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s}</span>;
}

/** Config-driven CRUD screen: searchable table + dialog editor + delete confirmation. */
export function ResourceManager({ resourceKey, rows }: { resourceKey: string; rows: Row[] }) {
  const config = resources[resourceKey];
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [confirm, setConfirm] = useState<Row | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const remove = (row: Row) =>
    startTransition(async () => {
      const res = await deleteRecord(resourceKey, row.id!);
      if (!res.ok) setError(res.error);
      setConfirm(null);
      router.refresh();
    });

  return (
    <div>
      <AdminPageHeader title={config.title} description={config.description}>
        <Button onClick={() => setEditing("new")}>
          <Plus /> New {config.singular.toLowerCase()}
        </Button>
      </AdminPageHeader>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${config.title.toLowerCase()}…`}
          aria-label={`Search ${config.title}`}
          className="h-10 w-full rounded-xl border border-line bg-white/[0.03] pl-10 pr-3 text-sm outline-none focus:border-primary/60"
        />
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-white/[0.02] text-xs uppercase tracking-wider text-muted">
            <tr>
              {config.columns.map((c) => (
                <th key={c.name} scope="col" className="px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
              <th scope="col" className="w-24 px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((row) => (
              <tr key={row.id} className="transition hover:bg-white/[0.02]">
                {config.columns.map((c, i) => (
                  <td key={c.name} className={i === 0 ? "max-w-xs px-4 py-3 font-medium" : "px-4 py-3 text-zinc-300"}>
                    <Cell value={row[c.name]} />
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => setEditing(row)} className="rounded-lg p-2 text-muted hover:bg-white/10 hover:text-fg" aria-label={`Edit ${String(row[config.columns[0].name])}`}>
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" onClick={() => setConfirm(row)} className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-400" aria-label={`Delete ${String(row[config.columns[0].name])}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-4 py-12 text-center text-muted">
                  {rows.length ? "No matches." : `No ${config.title.toLowerCase()} yet.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl pb-0">
          <DialogTitle className="text-xl font-semibold">{editing === "new" ? `New ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}`}</DialogTitle>
          <DialogDescription className="mb-6 text-sm text-muted">Changes go live on the public site immediately after saving.</DialogDescription>
          {editing !== null && (
            <RecordForm
              key={editing === "new" ? "new" : editing.id}
              config={config}
              record={editing === "new" ? null : editing}
              onDone={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-lg font-semibold">Delete this {config.singular.toLowerCase()}?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted">
            &ldquo;{confirm ? String(confirm[config.columns[0].name]) : ""}&rdquo; will be permanently removed. This can&apos;t be undone.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={pending} onClick={() => confirm && remove(confirm)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
