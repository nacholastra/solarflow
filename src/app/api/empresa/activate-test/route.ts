import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/config/plans";
import { PRO_ONLY_EMPRESA_FIELDS } from "@/lib/config/plan-features";

export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_TEST_PLAN !== "true") {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: equipo } = await supabase
      .from("equipo")
      .select("empresa_id, rol")
      .eq("usuario_id", user.id)
      .single();

    if (!equipo || equipo.rol !== "admin") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const service = await createServiceClient();
    const { error } = await service
      .from("empresas")
      .update({
        estado_suscripcion: "active",
        plan: "basic",
        leads_limite_mes: PLANS.basic.leadsLimit,
        leads_usados_mes: 0,
        periodo_reset: new Date().toISOString().slice(0, 10),
        ...PRO_ONLY_EMPRESA_FIELDS,
      })
      .eq("id", equipo.empresa_id);

    if (error) {
      return NextResponse.json({ error: "No se pudo activar el plan de prueba" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
