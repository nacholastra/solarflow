/**
 * Añade los eventos de cobro recurrente al webhook de PayPal.
 * Uso: node scripts/fix-paypal-webhook-events.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i)] = t.slice(i + 1).replace(/^"|"$/g, "");
  }
  return env;
}

const REQUIRED = [
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  "PAYMENT.SALE.COMPLETED",
  "PAYMENT.SALE.DENIED",
];

const env = loadEnv();
const webhookId = env.PAYPAL_WEBHOOK_ID;
if (!webhookId) {
  console.error("PAYPAL_WEBHOOK_ID no configurado");
  process.exit(1);
}

const base =
  env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

const auth = Buffer.from(
  `${env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`,
).toString("base64");

const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: "grant_type=client_credentials",
});
const { access_token: token } = await tokenRes.json();

const patchRes = await fetch(`${base}/v1/notifications/webhooks/${webhookId}`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify([
    {
      op: "replace",
      path: "/event_types",
      value: REQUIRED.map((name) => ({ name })),
    },
  ]),
});

if (!patchRes.ok) {
  const err = await patchRes.json();
  console.error("Error al actualizar webhook:", err);
  process.exit(1);
}

const updated = await patchRes.json();
console.log("Webhook actualizado:", updated.id);
console.log("Eventos suscritos:");
for (const e of updated.event_types ?? []) {
  console.log(`  ✓ ${e.name}`);
}
