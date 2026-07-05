import { NextResponse } from "next/server";
import { getPayPalPlanId } from "@/lib/config/plans";
import type { Currency, PlanId } from "@/lib/config/plans";

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
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";
    if (!clientId || clientId.startsWith("your-") || !clientSecret || clientSecret.startsWith("your-")) {
      return NextResponse.json(
        { error: "PayPal no configurado. Completa las variables en .env.local" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      plan: PlanId;
      currency: Currency;
      empresaId: string;
    };

    const planId = getPayPalPlanId(body.plan, body.currency);
    if (!planId) {
      return NextResponse.json(
        { error: "Plan PayPal no configurado en .env" },
        { status: 500 },
      );
    }

    const token = await getPayPalAccessToken();
    const base =
      process.env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const res = await fetch(`${base}/v1/billing/subscriptions`, {
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
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
