"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Film, ImagePlus, Loader2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listMedia, uploadMedia } from "@/lib/admin/media";
import type { MediaItem } from "@/types";

/** Pick an existing asset from the media library, or upload a new one. */
export function MediaPicker({ open, onOpenChange, onSelect, kind = "image" }: { open: boolean; onOpenChange: (o: boolean) => void; onSelect: (url: string) => void; kind?: "image" | "video" | "pdf" }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listMedia(kind)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, kind]);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const item = await uploadMedia(files[0]);
      onSelect(item.url);
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const accept = kind === "image" ? "image/*" : kind === "video" ? "video/mp4,video/webm" : "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="text-lg font-semibold">Media library</DialogTitle>
        <DialogDescription className="text-sm text-muted">Choose a file or upload a new one.</DialogDescription>
        <div className="mt-5 flex items-center gap-3">
          <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={(e) => onUpload(e.target.files)} />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <div className="mt-5 grid max-h-[55dvh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4">
          {loading && <Loader2 className="size-5 animate-spin text-muted" />}
          {!loading && items.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted">
              <ImagePlus className="mx-auto mb-2 size-6" /> No files yet.
            </p>
          )}
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelect(m.url);
                onOpenChange(false);
              }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-white/[0.03] text-left focus-visible:ring-2 focus-visible:ring-accent"
            >
              {m.mime_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.name} className="size-full object-cover transition group-hover:scale-105" loading="lazy" />
              ) : (
                <span className="grid size-full place-items-center text-muted">{m.mime_type.startsWith("video/") ? <Film className="size-8" /> : <FileText className="size-8" />}</span>
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-[10px]">{m.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
