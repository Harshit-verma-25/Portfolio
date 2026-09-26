"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUDGETS } from "@/lib/validation/budgets";
import { track } from "@/lib/analytics";

type Errors = Partial<Record<"name" | "email" | "subject" | "message" | "budget", string[]>>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Errors>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("loading");
    setError(null);
    setFields({});
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    if (res?.ok) {
      setStatus("success");
      track("contact_submitted", { budget: data.budget });
      form.reset();
    } else {
      setStatus("error");
      setError(json?.error ?? "Network error — please try again.");
      setFields(json?.fields ?? {});
    }
  };

  const fieldError = (name: keyof Errors) =>
    fields[name]?.[0] ? (
      <p id={`${name}-error`} className="mt-1.5 text-xs text-red-400">
        {fields[name]![0]}
      </p>
    ) : null;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <m.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass flex min-h-[420px] flex-col items-center justify-center rounded-3xl p-10 text-center" role="status">
            <CheckCircle2 className="size-12 text-success" />
            <h3 className="mt-5 text-2xl font-semibold">Message received.</h3>
            <p className="mt-2 max-w-sm text-muted">Thanks for reaching out — I usually reply within 24 hours.</p>
            <Button variant="outline" className="mt-8" onClick={() => setStatus("idle")}>
              Send another
            </Button>
          </m.div>
        ) : (
          <m.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={onSubmit} className="glass space-y-5 rounded-3xl p-6 md:p-8" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" autoComplete="name" required className="mt-2" aria-invalid={!!fields.name} aria-describedby={fields.name ? "name-error" : undefined} />
                {fieldError("name")}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required className="mt-2" aria-invalid={!!fields.email} aria-describedby={fields.email ? "email-error" : undefined} />
                {fieldError("email")}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required className="mt-2" aria-invalid={!!fields.subject} aria-describedby={fields.subject ? "subject-error" : undefined} />
                {fieldError("subject")}
              </div>
              <div>
                <Label htmlFor="budget">Budget / type</Label>
                <Select id="budget" name="budget" defaultValue="" className="mt-2">
                  <option value="">Select…</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required rows={6} className="mt-2" placeholder="What are you building? What's the timeline?" aria-invalid={!!fields.message} aria-describedby={fields.message ? "message-error" : undefined} />
              {fieldError("message")}
            </div>
            <div aria-hidden className="absolute -left-[9999px]">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            {error && (
              <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
            <Button type="submit" variant="brand" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
              {status === "loading" ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              {status === "loading" ? "Sending…" : "Send message"}
            </Button>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}
