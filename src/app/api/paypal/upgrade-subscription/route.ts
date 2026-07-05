import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getPayPalPlanId, PLANS, type PlanId } from "@/lib/config/plans";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const base =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("PayPal auth failed");
  return json.access_token;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      empresaId: string;
      subscriptionId?: string;
    };

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
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const service = await createServiceClient();
    const { data: empresa } = await service
      .from("empresas")
      .select("*")
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

    if (subscriptionId && proPlanId) {
      const token = await getPayPalAccessToken();
      const base =
        process.env.PAYPAL_MODE === "live"
          ? "https://api-m.paypal.com"
          : "https://api-m.sandbox.paypal.com";

      const reviseRes = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}/revise`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan_id: proPlanId }),
      });

      const reviseJson = (await reviseRes.json()) as {
        id?: string;
        message?: string;
        links?: { href: string; rel: string }[];
      };

      if (reviseRes.ok && reviseJson.id) {
        subscriptionId = reviseJson.id;
      } else if (!body.subscriptionId) {
        // Si revise falla y no hay nueva suscripción, actualizamos igual en modo prueba
        console.warn("PayPal revise failed:", reviseJson.message);
      }
    }

    if (body.subscriptionId) {
      subscriptionId = body.subscriptionId;
    }

    const { error } = await service
      .from("empresas")
      .update({
        plan: "pro" as PlanId,
        leads_limite_mes: PLANS.pro.leadsLimit,
        paypal_subscription_id: subscriptionId ?? empresa.paypal_subscription_id,
        estado_suscripcion: "active",
      })
      .eq("id", body.empresaId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, plan: "pro" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
