import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyPayPalWebhook } from "@/lib/paypal/client";
import {
  handlePayPalWebhookEvent,
  type PayPalWebhookEvent,
} from "@/lib/paypal/subscription-billing";

export async function POST(request: Request) {
  const body = await request.text();

  const verified = await verifyPayPalWebhook(request, body);
  if (!verified) {
    return NextResponse.json({ error: "Firma de webhook inválida" }, { status: 401 });
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(body) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  try {
    const supabase = await createServiceClient();
    await handlePayPalWebhookEvent(supabase, event);
  } catch (e) {
    console.error(`PayPal webhook ${event.event_type}:`, e);
    return NextResponse.json({ error: "Error al procesar evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
