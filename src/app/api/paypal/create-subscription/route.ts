import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPayPalPlanId } from "@/lib/config/plans";
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal/client";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["basic", "pro"]),
  currency: z.enum(["EUR", "USD"]),
  empresaId: z.string().uuid(),
});

type PayPalApiError = {
  message?: string;
  details?: Array<{ field?: string; description?: string; issue?: string }>;
};

function formatPayPalError(json: PayPalApiError): string {
  const parts = json.details?.map((d) => {
    const field = d.field?.replace(/^\/body\//, "") ?? "";
    const msg = d.description ?? d.issue ?? "";
    return field ? `${field}: ${msg}` : msg;
  }).filter(Boolean) ?? [];

  const unique = [...new Set(parts)];
  if (unique.length > 0) return unique.join(". ");
  return json.message ?? "Error de PayPal al crear la suscripción";
}

export async function POST(request: Request) {
  try {
    const limited = rateLimitResponse(request, "paypal-create", 15, 60_000);
    if (limited) return limited;

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
      return NextResponse.json(
        {
          error: `Plan PayPal no configurado para ${body.plan.toUpperCase()} en ${body.currency}. Revisa PAYPAL_PLAN_ID_* en Vercel.`,
        },
        { status: 500 },
      );
    }

    const token = await getPayPalAccessToken();

    // Con el JS SDK no enviamos return_url/cancel_url: el popup gestiona la aprobación.
    const res = await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: body.empresaId,
      }),
    });

    const json = (await res.json()) as { id?: string } & PayPalApiError;
    if (!res.ok || !json.id) {
      console.error("PayPal create subscription failed:", JSON.stringify(json));
      return NextResponse.json({ error: formatPayPalError(json) }, { status: 502 });
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
