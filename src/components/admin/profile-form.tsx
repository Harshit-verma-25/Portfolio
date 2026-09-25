"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveProfile } from "@/app/admin/actions";
import type { Profile } from "@/types";
import { MediaPicker } from "./media-picker";

const SOCIALS = ["github", "linkedin", "instagram", "twitter", "leetcode"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="glass space-y-5 rounded-3xl p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </fieldset>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [p, setP] = useState(profile);
  const [itemsText, setItemsText] = useState(profile.now_building.items.join("\n"));
  const [picker, setPicker] = useState<null | "avatar" | "resume">(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const res = await saveProfile({
        ...p,
        socials: Object.fromEntries(Object.entries(p.socials).filter(([, v]) => v)),
        now_building: { ...p.now_building, items: itemsText.split("\n").map((s) => s.trim()).filter(Boolean) },
      });
      setStatus(res.ok ? { ok: true, text: "Profile saved — the site is updated." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });
  };

  const text = (k: "name" | "title" | "tagline" | "location" | "email", label: string) => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={p[k]} onChange={(e) => set(k, e.target.value)} className="mt-2" />
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Identity">
        <div className="grid gap-5 sm:grid-cols-2">
          {text("name", "Name")}
          {text("title", "Title")}
          {text("location", "Location")}
          {text("email", "Public email")}
        </div>
        {text("tagline", "Tagline")}
        <div>
          <Label htmlFor="hero_text">Hero text</Label>
          <Textarea id="hero_text" value={p.hero_text} onChange={(e) => set("hero_text", e.target.value)} className="mt-2" rows={3} />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={p.bio} onChange={(e) => set("bio", e.target.value)} className="mt-2" rows={6} />
        </div>
        <div className="flex items-center gap-3">
          <Switch id="available" checked={p.available_for_work} onCheckedChange={(c) => set("available_for_work", c)} />
          <Label htmlFor="available" className="normal-case tracking-normal text-zinc-300">
            Show “Available for new projects” badge
          </Label>
        </div>
      </Section>

      <Section title="Assets">
        <div>
          <Label htmlFor="avatar">Profile image</Label>
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.avatar_url} alt="" className="size-14 rounded-xl border border-line object-cover" />
            <Input id="avatar" value={p.avatar_url} onChange={(e) => set("avatar_url", e.target.value)} />
            <Button type="button" variant="outline" size="sm" onClick={() => setPicker("avatar")}>
              Choose
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="resume">Résumé (PDF)</Label>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-line text-muted">
              <FileText className="size-5" />
            </span>
            <Input id="resume" value={p.resume_url} onChange={(e) => set("resume_url", e.target.value)} />
            <Button type="button" variant="outline" size="sm" onClick={() => setPicker("resume")}>
              Choose
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Social links">
        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIALS.map((s) => (
            <div key={s}>
              <Label htmlFor={`social-${s}`} className="capitalize">
                {s}
              </Label>
              <Input id={`social-${s}`} type="url" value={p.socials[s] ?? ""} onChange={(e) => set("socials", { ...p.socials, [s]: e.target.value })} className="mt-2" placeholder="https://" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Now building">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="nb-company">Company</Label>
            <Input id="nb-company" value={p.now_building.company} onChange={(e) => set("now_building", { ...p.now_building, company: e.target.value })} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="nb-role">Role</Label>
            <Input id="nb-role" value={p.now_building.role} onChange={(e) => set("now_building", { ...p.now_building, role: e.target.value })} className="mt-2" />
          </div>
        </div>
        <div>
          <Label htmlFor="nb-summary">Summary</Label>
          <Textarea id="nb-summary" value={p.now_building.summary} onChange={(e) => set("now_building", { ...p.now_building, summary: e.target.value })} className="mt-2" rows={3} />
        </div>
        <div>
          <Label htmlFor="nb-items">Highlights (one per line)</Label>
          <Textarea id="nb-items" value={itemsText} onChange={(e) => setItemsText(e.target.value)} className="mt-2" rows={4} />
        </div>
      </Section>

      {status && (
        <p role={status.ok ? "status" : "alert"} className={status.ok ? "flex items-center gap-2 text-sm text-green-300" : "text-sm text-red-400"}>
          {status.ok && <CheckCircle2 className="size-4" />} {status.text}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Save profile
      </Button>

      <MediaPicker
        open={picker !== null}
        kind={picker === "resume" ? "pdf" : "image"}
        onOpenChange={(o) => !o && setPicker(null)}
        onSelect={(url) => (picker === "resume" ? set("resume_url", url) : set("avatar_url", url))}
      />
    </form>
  );
}
