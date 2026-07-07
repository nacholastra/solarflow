import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdminEmail } from "@/lib/admin/super-admin";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/config/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin SolarFlow",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!isSuperAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              SolarFlow
            </p>
            <h1 className="text-lg font-semibold">Panel de administración</h1>
          </div>
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Volver al panel
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
