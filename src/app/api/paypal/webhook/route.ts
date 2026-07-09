import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyPayPalWebhook } from "@/lib/paypal/client";
import {
  handlePayPalWebhookEvent,
  type PayPalWebhookEvent,
} from "@/lib/paypal/subscription-billing";

export async function POST(request: Request) {
  const body = await request.text();
  const transmissionId = request.headers.get("paypal-transmission-id");

  const verified = await verifyPayPalWebhook(request, body);
  if (!verified) {
    return NextResponse.json({ error: "Firma de webhook inválida" }, { status: 401 });
  }

  if (!transmissionId) {
    return NextResponse.json({ error: "Transmission ID requerido" }, { status: 400 });
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(body) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error: insertError } = await supabase.from("paypal_webhook_events").insert({
    transmission_id: transmissionId,
    event_type: event.event_type,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("PayPal webhook idempotency insert:", insertError.message);
    return NextResponse.json({ error: "Error de idempotencia" }, { status: 500 });
  }

  try {
    await handlePayPalWebhookEvent(supabase, event);
  } catch (e) {
    await supabase.from("paypal_webhook_events").delete().eq("transmission_id", transmissionId);
    console.error(`PayPal webhook ${event.event_type}:`, e);
    return NextResponse.json({ error: "Error al procesar evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
