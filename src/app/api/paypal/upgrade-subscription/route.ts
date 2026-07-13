import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getPayPalPlanId, PLANS, type PlanId } from "@/lib/config/plans";
import {
  getPayPalApiBase,
  getPayPalAccessToken,
  getPayPalSubscription,
  subscriptionMatchesPlan,
} from "@/lib/paypal/client";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { z } from "zod";

const schema = z.object({
  empresaId: z.string().uuid(),
  subscriptionId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const limited = rateLimitResponse(request, "paypal-upgrade", 15, 60_000);
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
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const service = await createServiceClient();
    const { data: empresa } = await service
      .from("empresas")
      .select("id, plan, estado_suscripcion, moneda_facturacion, paypal_subscription_id")
      .eq("id", body.empresaId)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    if (empresa.plan === "pro") {
      return NextResponse.json({ error: "Ya tienes el plan Pro" }, { status: 400 });
    }

    if (empresa.estado_suscripcion !== "active") {
      return NextResponse.json({ error: "Activa un plan antes de mejorar" }, { status: 400 });
    }

    const currency = empresa.moneda_facturacion ?? "EUR";
    const proPlanId = getPayPalPlanId("pro", currency);

    if (!proPlanId) {
      return NextResponse.json({ error: "Plan Pro no configurado en PayPal" }, { status: 500 });
    }

    let subscriptionId = body.subscriptionId ?? empresa.paypal_subscription_id;

    if (!subscriptionId) {
      return NextResponse.json({ error: "Sin suscripción PayPal activa" }, { status: 400 });
    }

    if (!body.subscriptionId && subscriptionId) {
      const token = await getPayPalAccessToken();
      const reviseRes = await fetch(
        `${getPayPalApiBase()}/v1/billing/subscriptions/${subscriptionId}/revise`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan_id: proPlanId }),
        },
      );

      const reviseJson = (await reviseRes.json()) as { id?: string; message?: string };

      if (!reviseRes.ok || !reviseJson.id) {
        return NextResponse.json(
          { error: reviseJson.message ?? "No se pudo actualizar la suscripción en PayPal" },
          { status: 502 },
        );
      }

      subscriptionId = reviseJson.id;
    }

    const subscription = await getPayPalSubscription(subscriptionId);

    if (subscription.custom_id !== body.empresaId) {
      return NextResponse.json({ error: "La suscripción no pertenece a esta empresa" }, { status: 403 });
    }

    if (!["ACTIVE", "APPROVED"].includes(subscription.status)) {
      return NextResponse.json({ error: "La suscripción PayPal no está activa" }, { status: 400 });
    }

    if (!subscriptionMatchesPlan(subscription, "pro", currency)) {
      return NextResponse.json({ error: "El plan de PayPal no es Pro" }, { status: 400 });
    }

    const { error } = await service
      .from("empresas")
      .update({
        plan: "pro" as PlanId,
        leads_limite_mes: PLANS.pro.leadsLimit,
        paypal_subscription_id: subscriptionId,
        estado_suscripcion: "active",
        trial_ends_at: null,
      })
      .eq("id", body.empresaId);

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar el plan" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, plan: "pro" });
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
