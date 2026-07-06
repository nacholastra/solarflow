import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/config/seo";

export const metadata: Metadata = {
  robots: PRIVATE_PAGE_ROBOTS,
};

async function getEmpresaContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: equipo } = await supabase
    .from("equipo")
    .select("empresa_id")
    .eq("usuario_id", user.id)
    .single();

  if (!equipo) return null;

  const { data: empresa } = await supabase
    .from("empresas")
    .select("nombre_empresa, plan")
    .eq("id", equipo.empresa_id)
    .single();

  if (!empresa) return null;

  return {
    empresaNombre: empresa.nombre_empresa,
    plan: empresa.plan,
  };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const context = await getEmpresaContext();

  return (
    <div className="flex min-h-dvh bg-background">
      <DashboardSidebar
        empresaNombre={context?.empresaNombre ?? "Mi empresa"}
        plan={context?.plan ?? null}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
