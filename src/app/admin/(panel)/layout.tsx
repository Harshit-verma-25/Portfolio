import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AuthListener } from "@/components/admin/auth-listener";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s — Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await requireStaff();
  return (
    <div className="min-h-dvh bg-bg md:grid md:grid-cols-[260px_1fr]">
      <AuthListener />
      <AdminSidebar email={user.email ?? ""} role={role} />
      <main id="main" className="min-w-0 px-4 pb-16 pt-20 md:px-10 md:pt-10">
        {children}
      </main>
    </div>
  );
}
