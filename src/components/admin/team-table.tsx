"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/app/admin/actions";
import type { StaffProfile } from "@/types";

const ROLE_HELP = {
  admin: "Full access",
  editor: "Testimonials, certifications, achievements, leads",
  "": "No dashboard access",
};

export function TeamTable({ members, currentUserId }: { members: StaffProfile[]; currentUserId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          {error}
        </p>
      )}
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {members.map((m) => {
          const self = m.id === currentUserId;
          return (
            <li key={m.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {m.email} {self && <span className="ml-1 text-xs text-muted">(you)</span>}
                </p>
                <p className="text-xs text-muted">{ROLE_HELP[m.role ?? ""]} · joined {new Date(m.created_at).toLocaleDateString()}</p>
              </div>
              <label className="sr-only" htmlFor={`role-${m.id}`}>
                Role for {m.email}
              </label>
              <select
                id={`role-${m.id}`}
                value={m.role ?? ""}
                disabled={self || pending}
                onChange={(e) =>
                  startTransition(async () => {
                    setError(null);
                    const res = await setUserRole(m.id, e.target.value);
                    if (!res.ok) setError(res.error);
                    router.refresh();
                  })
                }
                className="h-10 rounded-xl border border-line bg-bg-elevated px-3 text-sm disabled:opacity-60"
              >
                <option value="">No access</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
