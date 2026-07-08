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

const env = loadEnv();
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
if (!token) {
  console.error("No se pudo autenticar con PayPal");
  process.exit(1);
}

const plans = [
  { label: "Basic EUR", id: env.PAYPAL_PLAN_ID_BASIC_EUR },
  { label: "Basic USD", id: env.PAYPAL_PLAN_ID_BASIC_USD },
  { label: "Pro EUR", id: env.PAYPAL_PLAN_ID_PRO_EUR },
  { label: "Pro USD", id: env.PAYPAL_PLAN_ID_PRO_USD },
];

const REQUIRED_EVENTS = [
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  "PAYMENT.SALE.COMPLETED",
  "PAYMENT.SALE.DENIED",
];

console.log(`\n=== Verificación de cobro mensual PayPal (${env.PAYPAL_MODE ?? "sandbox"}) ===\n`);

let allOk = true;

for (const p of plans) {
  if (!p.id) {
    console.log(`✗ ${p.label}: no configurado en .env.local`);
    allOk = false;
    continue;
  }

  const res = await fetch(`${base}/v1/billing/plans/${p.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();

  if (!res.ok) {
    console.log(`✗ ${p.label} (${p.id}): ${json.message ?? "error"}`);
    allOk = false;
    continue;
  }

  const cycle = json.billing_cycles?.[0];
  const interval = cycle?.frequency?.interval_unit;
  const count = cycle?.frequency?.interval_count ?? 1;
  const price = cycle?.pricing_scheme?.fixed_price;
  const isMonthly = interval === "MONTH" && count === 1;

  console.log(`${isMonthly ? "✓" : "✗"} ${p.label}`);
  console.log(`    ID: ${p.id}`);
  console.log(`    Estado: ${json.status}`);
  console.log(`    Ciclo: cada ${count} ${interval}`);
  console.log(`    Precio: ${price?.value ?? "?"} ${price?.currency_code ?? ""}`);

  if (!isMonthly) {
    console.log(`    ⚠ Debe ser MONTH / 1 para cobro mensual obligatorio`);
    allOk = false;
  }
  console.log();
}

if (env.PAYPAL_WEBHOOK_ID) {
  const whRes = await fetch(`${base}/v1/notifications/webhooks/${env.PAYPAL_WEBHOOK_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const wh = await whRes.json();

  if (whRes.ok) {
    const subscribed = (wh.event_types ?? []).map((e) => e.name);
    console.log("=== Webhook suscrito ===");
    console.log(`URL: ${wh.url}`);
    for (const ev of REQUIRED_EVENTS) {
      const ok = subscribed.includes(ev);
      if (!ok) allOk = false;
      console.log(`  ${ok ? "✓" : "✗"} ${ev}`);
    }
  } else {
    console.log(`✗ No se pudo leer webhook ${env.PAYPAL_WEBHOOK_ID}: ${wh.message ?? "error"}`);
    allOk = false;
  }
} else {
  console.log("✗ PAYPAL_WEBHOOK_ID no configurado");
  allOk = false;
}

console.log();
if (allOk) {
  console.log("Todo correcto: planes mensuales y webhooks configurados.");
} else {
  console.log("Hay problemas. Revisa los puntos marcados con ✗ arriba.");
  process.exit(1);
}
