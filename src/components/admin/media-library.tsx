"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, FileText, Film, Loader2, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED, formatBytes, uploadMedia } from "@/lib/admin/media";
import { deleteMedia } from "@/app/admin/actions";
import type { MediaItem } from "@/types";
import { AdminPageHeader } from "./page-header";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
  { key: "pdf", label: "PDFs" },
] as const;

export function MediaLibrary({ items, canDelete }: { items: MediaItem[]; canDelete: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () =>
      items.filter((m) =>
        filter === "all" ? true : filter === "image" ? m.mime_type.startsWith("image/") : filter === "video" ? m.mime_type.startsWith("video/") : m.mime_type === "application/pdf",
      ),
    [items, filter],
  );

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setError(null);
    setUploading(list.map((f) => f.name));
    const results = await Promise.allSettled(list.map(uploadMedia));
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failed.length) setError(failed.map((f) => (f.reason as Error).message).join(" · "));
    setUploading([]);
    router.refresh();
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <AdminPageHeader title="Media library" description="Images, videos and PDFs stored in Supabase Storage." />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn("flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center transition", dragging ? "border-primary bg-primary/10" : "border-line")}
      >
        {uploading.length ? <Loader2 className="size-8 animate-spin text-accent" /> : <UploadCloud className="size-8 text-muted" />}
        <p className="text-sm">{uploading.length ? `Uploading ${uploading.join(", ")}…` : "Drag & drop files here"}</p>
        <input ref={inputRef} type="file" multiple accept={ACCEPTED} className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-bg" disabled={uploading.length > 0}>
          Browse files
        </button>
        <p className="text-xs text-muted">Images, MP4/WebM video or PDF · up to 50 MB</p>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div role="group" aria-label="Filter media" className="mt-8 flex gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)} className={cn("rounded-full px-3 py-1.5 text-sm", filter === f.key ? "bg-white text-bg" : "text-muted hover:text-fg")}>
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((m) => (
          <li key={m.id} className="group overflow-hidden rounded-2xl border border-line bg-white/[0.02]">
            <div className="relative aspect-square bg-black/30">
              {m.mime_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.name} loading="lazy" className="size-full object-cover" />
              ) : m.mime_type.startsWith("video/") ? (
                <video src={m.url} muted preload="metadata" className="size-full object-cover" aria-label={m.name} />
              ) : (
                <span className="grid size-full place-items-center text-muted">
                  <FileText className="size-10" />
                </span>
              )}
              {m.mime_type.startsWith("video/") && <Film className="absolute left-2 top-2 size-4" aria-hidden />}
              <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                <button type="button" onClick={() => copy(m.url)} className="rounded-lg bg-black/70 p-2" aria-label={`Copy URL of ${m.name}`}>
                  {copied === m.url ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
                </button>
                {canDelete && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm(`Delete ${m.name}? Pages using it will show a broken image.`)) return;
                      startTransition(async () => {
                        const res = await deleteMedia(m.id, m.path);
                        if (!res.ok) setError(res.error);
                        router.refresh();
                      });
                    }}
                    className="rounded-lg bg-black/70 p-2 hover:text-red-400"
                    aria-label={`Delete ${m.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-medium">{m.name}</p>
              <p className="font-mono text-[10px] text-muted">{formatBytes(m.size)}</p>
            </div>
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p className="mt-10 text-center text-sm text-muted">No files here yet.</p>}
    </div>
  );
}
