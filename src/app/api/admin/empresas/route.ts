import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdminAuthenticated } from "@/lib/admin/guard";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const service = await createServiceClient();
    const { data: empresas, error } = await service
      .from("empresas")
      .select(
        "id, nombre_empresa, slug, plan, estado_suscripcion, leads_limite_mes, leads_usados_mes, moneda_facturacion, owner_id, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("admin empresas list:", error.message);
      return NextResponse.json({ error: "No se pudieron cargar las empresas" }, { status: 500 });
    }

    const ownerIds = [...new Set((empresas ?? []).map((e) => e.owner_id))];
    const ownerEmails: Record<string, string> = {};

    await Promise.all(
      ownerIds.map(async (id) => {
        const { data } = await service.auth.admin.getUserById(id);
        if (data.user?.email) ownerEmails[id] = data.user.email;
      }),
    );

    const { data: equipoCounts } = await service.from("equipo").select("empresa_id");
    const miembrosPorEmpresa: Record<string, number> = {};
    for (const row of equipoCounts ?? []) {
      miembrosPorEmpresa[row.empresa_id] = (miembrosPorEmpresa[row.empresa_id] ?? 0) + 1;
    }

    const rows = (empresas ?? []).map((e) => ({
      ...e,
      owner_email: ownerEmails[e.owner_id] ?? "—",
      miembros: miembrosPorEmpresa[e.id] ?? 0,
    }));

    return NextResponse.json({ empresas: rows });
  } catch (e) {
    console.error("admin GET error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
