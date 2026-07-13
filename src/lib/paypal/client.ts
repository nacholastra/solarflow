import { getAcceptedPayPalPlanIds, getPayPalPlanId, type Currency, type PlanId } from "@/lib/config/plans";

export function getPayPalApiBase(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal no configurado");
  }

  const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
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

export interface PayPalSubscription {
  id: string;
  status: string;
  custom_id?: string;
  plan_id?: string;
  billing_info?: {
    next_billing_time?: string;
    last_payment?: { time?: string };
  };
}

export async function getPayPalSubscription(subscriptionId: string): Promise<PayPalSubscription> {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json()) as PayPalSubscription & { message?: string };
  if (!res.ok) {
    throw new Error(json.message ?? "Suscripción PayPal no encontrada");
  }
  return json;
}

/** Devuelve la fecha del próximo cobro (next_billing_time) o null si no está disponible. */
export async function getPayPalNextBillingTime(subscriptionId: string): Promise<string | null> {
  try {
    const sub = await getPayPalSubscription(subscriptionId);
    return sub.billing_info?.next_billing_time ?? null;
  } catch (e) {
    console.warn("No se pudo obtener next_billing_time de PayPal:", e);
    return null;
  }
}

export function subscriptionMatchesPlan(
  sub: PayPalSubscription,
  plan: PlanId,
  currency: Currency,
  options?: { earlyBird?: boolean },
): boolean {
  if (!sub.plan_id) return false;

  if (options?.earlyBird) {
    const preferred = getPayPalPlanId(plan, currency, { earlyBird: true });
    if (preferred) return sub.plan_id === preferred;
  }

  return getAcceptedPayPalPlanIds(plan, currency).includes(sub.plan_id);
}

export async function cancelPayPalSubscription(subscriptionId: string): Promise<void> {
  try {
    const token = await getPayPalAccessToken();
    await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "Cuenta eliminada" }),
    });
  } catch (e) {
    console.error("PayPal cancel subscription failed:", e);
  }
}

export async function verifyPayPalWebhook(request: Request, body: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID no configurado — webhook rechazado");
    return false;
  }

  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const transmissionSig = request.headers.get("paypal-transmission-sig");
  const certUrl = request.headers.get("paypal-cert-url");
  const authAlgo = request.headers.get("paypal-auth-algo");

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    return false;
  }

  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(body);
  } catch {
    return false;
  }

  const token = await getPayPalAccessToken();
  const res = await fetch(`${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
  });

  const json = (await res.json()) as { verification_status?: string };
  return json.verification_status === "SUCCESS";
}
