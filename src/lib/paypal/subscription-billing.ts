import type { SupabaseClient } from "@supabase/supabase-js";
import { getLeadsLimit, type PlanId } from "@/lib/config/plans";

export type PayPalWebhookResource = {
  id?: string;
  custom_id?: string;
  status?: string;
  billing_agreement_id?: string;
  plan_id?: string;
};

export type PayPalWebhookEvent = {
  event_type: string;
  resource: PayPalWebhookResource;
};

/** Extrae el ID de suscripción según el tipo de evento PayPal. */
export function extractSubscriptionId(event: PayPalWebhookEvent): string | null {
  const { event_type, resource } = event;

  if (event_type === "PAYMENT.SALE.COMPLETED" || event_type === "PAYMENT.SALE.DENIED") {
    return resource.billing_agreement_id ?? null;
  }

  return resource.id ?? null;
}

/** Reinicia el contador mensual de leads al confirmar un cobro recurrente. */
export async function onSubscriptionPaymentSucceeded(
  service: SupabaseClient,
  subscriptionId: string,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: empresa } = await service
    .from("empresas")
    .select("id, plan, estado_suscripcion")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle();

  if (!empresa) {
    console.warn(`Pago recibido para suscripción desconocida: ${subscriptionId}`);
    return;
  }

  const plan = (empresa.plan ?? "basic") as PlanId;

  await service
    .from("empresas")
    .update({
      estado_suscripcion: "active",
      leads_limite_mes: getLeadsLimit(plan),
      leads_usados_mes: 0,
      periodo_reset: today,
    })
    .eq("id", empresa.id);
}

export async function onSubscriptionActivated(
  service: SupabaseClient,
  subscriptionId: string,
  empresaId: string,
): Promise<void> {
  const { data: emp } = await service.from("empresas").select("plan").eq("id", empresaId).single();
  const plan = (emp?.plan ?? "basic") as PlanId;
  const today = new Date().toISOString().slice(0, 10);

  await service
    .from("empresas")
    .update({
      paypal_subscription_id: subscriptionId,
      estado_suscripcion: "active",
      leads_limite_mes: getLeadsLimit(plan),
      leads_usados_mes: 0,
      periodo_reset: today,
    })
    .eq("id", empresaId);
}

export async function setSubscriptionStatus(
  service: SupabaseClient,
  subscriptionId: string,
  estado: "suspended" | "cancelled",
): Promise<void> {
  await service
    .from("empresas")
    .update({ estado_suscripcion: estado })
    .eq("paypal_subscription_id", subscriptionId);
}

/** Eventos que deben estar suscritos en el webhook de PayPal. */
export const REQUIRED_PAYPAL_WEBHOOK_EVENTS = [
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  "PAYMENT.SALE.COMPLETED",
  "PAYMENT.SALE.DENIED",
] as const;

export async function handlePayPalWebhookEvent(
  service: SupabaseClient,
  event: PayPalWebhookEvent,
): Promise<void> {
  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const empresaId = event.resource.custom_id;
      const subId = event.resource.id;
      if (!empresaId || !subId) break;
      await onSubscriptionActivated(service, subId, empresaId);
      break;
    }

    case "PAYMENT.SALE.COMPLETED": {
      const subId = extractSubscriptionId(event);
      if (!subId) break;
      await onSubscriptionPaymentSucceeded(service, subId);
      break;
    }

    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.EXPIRED": {
      const subId = extractSubscriptionId(event);
      if (!subId) break;
      await setSubscriptionStatus(service, subId, "cancelled");
      break;
    }

    case "BILLING.SUBSCRIPTION.SUSPENDED":
    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
    case "PAYMENT.SALE.DENIED": {
      const subId = extractSubscriptionId(event);
      if (!subId) break;
      await setSubscriptionStatus(service, subId, "suspended");
      break;
    }

    default:
      break;
  }
}
