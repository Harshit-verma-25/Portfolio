"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

/** Calendly inline scheduler, mounted on demand so the third-party iframe never blocks first paint. */
export function CalendlyEmbed({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  if (!url) return null;
  const src = `${url}${url.includes("?") ? "&" : "?"}embed_type=Inline&hide_gdpr_banner=1&background_color=0b1024&text_color=ffffff&primary_color=6366f1`;
  return (
    <div className="glass overflow-hidden rounded-3xl">
      {open ? (
        <iframe src={src} title="Book a call with Harshit on Calendly" className="h-[660px] w-full" loading="lazy" />
      ) : (
        <div className="flex flex-col items-start gap-4 p-6 md:p-8">
          <CalendarDays className="size-6 text-accent" />
          <div>
            <h3 className="text-lg font-semibold">Prefer to talk?</h3>
            <p className="mt-1 text-sm text-muted">Pick a 30-minute slot that works for you.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(true);
              track("calendly_opened");
            }}
          >
            Book a call
          </Button>
        </div>
      )}
    </div>
  );
}
