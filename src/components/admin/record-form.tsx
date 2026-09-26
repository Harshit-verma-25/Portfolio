"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Field, ResourceConfig } from "@/lib/admin/resources";
import { saveRecord } from "@/app/admin/actions";
import { MarkdownEditor } from "./markdown-editor";
import { MediaPicker } from "./media-picker";

export type Row = Record<string, unknown> & { id?: string };

/** Turns a DB row into editable form state (strings for inputs, arrays/booleans kept). */
function toFormValue(field: Field, v: unknown): unknown {
  if (v === null || v === undefined || v === "") {
    // A required dropdown must start on a real option — otherwise it *shows* the first option
    // while submitting an empty value.
    if (field.type === "select" && field.required && field.options?.length) return field.options.find((o) => o !== "") ?? "";
    if (field.type === "switch") return false;
    if (field.type === "images") return [];
    if (field.type === "color") return "#6366F1";
    return "";
  }
  switch (field.type) {
    case "tags":
      return Array.isArray(v) ? v.join(", ") : String(v);
    case "lines":
      return Array.isArray(v) ? v.join("\n") : String(v);
    case "json":
      return typeof v === "string" ? v : JSON.stringify(v, null, 2);
    case "date":
      return String(v).slice(0, 10);
    case "switch":
    case "images":
      return v;
    default:
      return String(v);
  }
}

function ImageField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="size-12 shrink-0 rounded-lg border border-line object-cover" />
      ) : (
        <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-dashed border-line text-muted">
          <ImagePlus className="size-4" />
        </span>
      )}
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or choose" />
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Choose
      </Button>
      <MediaPicker open={open} onOpenChange={setOpen} onSelect={onChange} />
    </div>
  );
}

function ImagesField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {value.map((url, i) => (
        <div key={url + i} className="group relative size-24 overflow-hidden rounded-xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="size-full object-cover" />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1" aria-label="Remove image">
            <X className="size-3" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setOpen(true)} className="grid size-24 place-items-center rounded-xl border border-dashed border-line text-muted hover:text-fg" aria-label="Add image">
        <Plus className="size-5" />
      </button>
      <MediaPicker open={open} onOpenChange={setOpen} onSelect={(url) => onChange([...value, url])} />
    </div>
  );
}

export function RecordForm({ config, record, onDone }: { config: ResourceConfig; record: Row | null; onDone: (id: string) => void }) {
  const [values, setValues] = useState<Record<string, unknown>>(() => Object.fromEntries(config.fields.map((f) => [f.name, toFormValue(f, record?.[f.name])])));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const set = (name: string, v: unknown) => setValues((prev) => ({ ...prev, [name]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveRecord(config.key, record?.id ?? null, values);
      if (res.ok) onDone(res.id ?? record?.id ?? "");
      else setError(res.error);
    });
  };

  const renderInput = (f: Field) => {
    const id = `field-${f.name}`;
    const v = values[f.name];
    switch (f.type) {
      case "textarea":
        return <Textarea id={id} value={String(v)} onChange={(e) => set(f.name, e.target.value)} className="mt-2" rows={4} placeholder={f.placeholder} />;
      case "lines":
        return <Textarea id={id} value={String(v)} onChange={(e) => set(f.name, e.target.value)} className="mt-2" rows={5} placeholder="One item per line" />;
      case "json":
        return <Textarea id={id} value={String(v)} onChange={(e) => set(f.name, e.target.value)} className="mt-2 font-mono text-xs" rows={14} placeholder={f.placeholder} spellCheck={false} />;
      case "markdown":
        return (
          <div className="mt-2">
            <MarkdownEditor id={id} value={String(v)} onChange={(nv) => set(f.name, nv)} />
          </div>
        );
      case "select":
        return (
          <Select id={id} value={String(v)} onChange={(e) => set(f.name, e.target.value)} className="mt-2">
            {!f.required && !f.options?.includes("") && <option value="">—</option>}
            {f.options?.map((o) => (
              <option key={o} value={o}>
                {o || "None"}
              </option>
            ))}
          </Select>
        );
      case "switch":
        return (
          <div className="mt-3">
            <Switch id={id} checked={Boolean(v)} onCheckedChange={(c) => set(f.name, c)} />
          </div>
        );
      case "image":
        return <ImageField id={id} value={String(v)} onChange={(nv) => set(f.name, nv)} />;
      case "images":
        return <ImagesField value={(v as string[]) ?? []} onChange={(nv) => set(f.name, nv)} />;
      case "color":
        return (
          <div className="mt-2 flex items-center gap-3">
            <input type="color" value={String(v)} onChange={(e) => set(f.name, e.target.value)} className="size-11 cursor-pointer rounded-lg border border-line bg-transparent" aria-label={f.label} />
            <Input id={id} value={String(v)} onChange={(e) => set(f.name, e.target.value)} />
          </div>
        );
      default:
        return (
          <Input
            id={id}
            type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text"}
            step={f.type === "number" ? "any" : undefined}
            value={String(v)}
            onChange={(e) => set(f.name, e.target.value)}
            placeholder={f.placeholder}
            className="mt-2"
          />
        );
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {config.fields.map((f) => (
          <div key={f.name} className={cn(f.wide || f.type === "markdown" || f.type === "json" ? "sm:col-span-2" : "")}>
            <Label htmlFor={`field-${f.name}`}>
              {f.label}
              {f.required && <span className="text-red-400"> *</span>}
            </Label>
            {renderInput(f)}
            {f.help && <p className="mt-1.5 text-xs text-muted">{f.help}</p>}
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-line bg-bg-elevated/95 px-6 py-4 sm:-mx-8 sm:px-8">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} {record ? "Save changes" : `Create ${config.singular.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}
