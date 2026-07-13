import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PLANS, type Currency, type PlanId } from "@/lib/config/plans";
import { PRO_ONLY_EMPRESA_FIELDS } from "@/lib/config/plan-features";
import { getPayPalSubscription, subscriptionMatchesPlan } from "@/lib/paypal/client";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { z } from "zod";

const schema = z.object({
  subscriptionId: z.string().min(1),
  plan: z.enum(["basic", "pro"]),
  currency: z.enum(["EUR", "USD"]),
  empresaId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const limited = rateLimitResponse(request, "paypal-activate", 15, 60_000);
    if (limited) return limited;

    const body = schema.parse(await request.json());
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
      .eq("empresa_id", body.empresaId)
      .single();

    if (!equipo || equipo.rol !== "admin") {
      return NextResponse.json({ error: "Sin permisos para activar el plan" }, { status: 403 });
    }

    const subscription = await getPayPalSubscription(body.subscriptionId);

    if (subscription.custom_id !== body.empresaId) {
      return NextResponse.json({ error: "La suscripción no pertenece a esta empresa" }, { status: 403 });
    }

    if (!["ACTIVE", "APPROVED"].includes(subscription.status)) {
      return NextResponse.json({ error: "La suscripción PayPal no está activa" }, { status: 400 });
    }

    const service = await createServiceClient();
    const { data: empresaBilling } = await service
      .from("empresas")
      .select("early_bird")
      .eq("id", body.empresaId)
      .single();

    if (
      !subscriptionMatchesPlan(subscription, body.plan, body.currency, {
        earlyBird: Boolean(empresaBilling?.early_bird),
      })
    ) {
      return NextResponse.json({ error: "El plan de PayPal no coincide" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      paypal_subscription_id: body.subscriptionId,
      plan: body.plan as PlanId,
      moneda_facturacion: body.currency as Currency,
      estado_suscripcion: "active",
      trial_ends_at: null,
      leads_limite_mes: PLANS[body.plan].leadsLimit,
      leads_usados_mes: 0,
      periodo_reset: new Date().toISOString().slice(0, 10),
    };
    if (body.plan === "basic") {
      Object.assign(updatePayload, PRO_ONLY_EMPRESA_FIELDS);
    }
    const { error } = await service.from("empresas").update(updatePayload).eq("id", body.empresaId);

    if (error) {
      return NextResponse.json({ error: "No se pudo activar el plan" }, { status: 500 });
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
