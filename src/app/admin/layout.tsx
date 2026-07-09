import { isAdminAuthenticated } from "@/lib/admin/guard";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/config/seo";
import { AdminLogoutButton } from "./logout-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated();

  // La página de login se renderiza sin marco. El acceso a las demás rutas
  // /admin lo garantiza el middleware (redirige a /admin/login si no hay sesión).
  if (!authed) {
    return <>{children}</>;
  }

  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <header className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Administración
            </p>
            <h1 className="text-lg font-semibold">Panel de control</h1>
          </div>
          <AdminLogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
