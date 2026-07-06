import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getLeadsLimit, type PlanId } from "@/lib/config/plans";
import { verifyPayPalWebhook } from "@/lib/paypal/client";

export async function POST(request: Request) {
  const body = await request.text();

  const verified = await verifyPayPalWebhook(request, body);
  if (!verified) {
    return NextResponse.json({ error: "Firma de webhook inválida" }, { status: 401 });
  }

  let event: {
    event_type: string;
    resource: { id?: string; custom_id?: string; status?: string };
  };

  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const empresaId = event.resource.custom_id;
      const subId = event.resource.id;
      if (!empresaId) break;
      const { data: emp } = await supabase.from("empresas").select("plan").eq("id", empresaId).single();
      const plan = (emp?.plan ?? "basic") as PlanId;
      await supabase
        .from("empresas")
        .update({
          paypal_subscription_id: subId,
          estado_suscripcion: "active",
          leads_limite_mes: getLeadsLimit(plan),
        })
        .eq("id", empresaId);
      break;
    }
    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.SUSPENDED": {
      const subId = event.resource.id;
      if (!subId) break;
      await supabase
        .from("empresas")
        .update({
          estado_suscripcion: event.event_type.includes("CANCELLED") ? "cancelled" : "suspended",
        })
        .eq("paypal_subscription_id", subId);
      break;
    }
    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
      const subId = event.resource.id;
      if (!subId) break;
      await supabase
        .from("empresas")
        .update({ estado_suscripcion: "suspended" })
        .eq("paypal_subscription_id", subId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
