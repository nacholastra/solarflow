import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPayPalPlanId } from "@/lib/config/plans";
import type { Currency, PlanId } from "@/lib/config/plans";
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal/client";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["basic", "pro"]),
  currency: z.enum(["EUR", "USD"]),
  empresaId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";
    if (!clientId || clientId.startsWith("your-") || !clientSecret || clientSecret.startsWith("your-")) {
      return NextResponse.json(
        { error: "PayPal no configurado. Completa las variables en .env.local" },
        { status: 503 },
      );
    }

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
      return NextResponse.json({ error: "Sin permisos para esta empresa" }, { status: 403 });
    }

    const planId = getPayPalPlanId(body.plan, body.currency);
    if (!planId) {
      return NextResponse.json({ error: "Plan PayPal no configurado en .env" }, { status: 500 });
    }

    const token = await getPayPalAccessToken();

    const res = await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: body.empresaId,
        application_context: {
          brand_name: "SolarFlow",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=1`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?cancel=1`,
        },
      }),
    });

    const json = (await res.json()) as { id?: string; message?: string };
    if (!json.id) {
      return NextResponse.json({ error: json.message ?? "PayPal error" }, { status: 500 });
    }
    return NextResponse.json({ id: json.id });
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
