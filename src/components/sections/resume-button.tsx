"use client";

import { Button } from "@/components/ui/button";
import { recordEvent, track } from "@/lib/analytics";

export function ResumeButton({ href, source, children }: { href: string; source: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="brand" size="lg">
      <a
        href={href}
        download
        onClick={() => {
          track("resume_downloaded", { source });
          recordEvent("resume_download", source);
        }}
      >
        {children}
      </a>
    </Button>
  );
}
