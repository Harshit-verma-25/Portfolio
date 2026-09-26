"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown when a dashboard page can't load its data (network, RLS or schema problems). */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="glass mx-auto mt-10 max-w-lg rounded-3xl p-8 text-center" role="alert">
      <AlertTriangle className="mx-auto size-8 text-warning" />
      <h1 className="mt-4 text-xl font-semibold">Couldn&apos;t load this page</h1>
      <p className="mt-2 text-sm text-muted">
        {/relation .* does not exist|schema cache/i.test(error.message)
          ? "The database tables are missing. Run the migration in supabase/migrations in the Supabase SQL editor."
          : "The database request failed. Check your connection and Supabase configuration, then try again."}
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-zinc-400">ref {error.digest}</p>}
      <Button className="mt-6" onClick={reset}>
        <RotateCcw /> Try again
      </Button>
    </div>
  );
}
