import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PLANS, type Currency, type PlanId } from "@/lib/config/plans";
import { z } from "zod";

const schema = z.object({
  subscriptionId: z.string().min(1),
  plan: z.enum(["basic", "pro"]),
  currency: z.enum(["EUR", "USD"]),
  empresaId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: equipo } = await supabase
      .from("equipo")
      .select("empresa_id, rol")
      .eq("usuario_id", user.id)
      .eq("empresa_id", body.empresaId)
      .single();

    if (!equipo || equipo.rol !== "admin") {
      return NextResponse.json({ error: "Sin permisos para activar el plan" }, { status: 403 });
    }

    const service = await createServiceClient();
    const { error } = await service
      .from("empresas")
      .update({
        paypal_subscription_id: body.subscriptionId,
        plan: body.plan as PlanId,
        moneda_facturacion: body.currency as Currency,
        estado_suscripcion: "active",
        leads_limite_mes: PLANS[body.plan].leadsLimit,
        leads_usados_mes: 0,
        periodo_reset: new Date().toISOString().slice(0, 10),
      })
      .eq("id", body.empresaId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
