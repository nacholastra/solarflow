/**
 * Verifica migración 008 y rellena proximo_cobro para suscripciones activas.
 * Uso: node scripts/verify-migration-008.mjs
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

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

const paypalBase =
  env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getPayPalToken() {
  const auth = Buffer.from(
    `${env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch(`${paypalBase}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const json = await res.json();
  return json.access_token ?? null;
}

// 1. Verificar columna proximo_cobro
const colRes = await fetch(
  `${supabaseUrl}/rest/v1/empresas?select=id,nombre_empresa,estado_suscripcion,plan,proximo_cobro,paypal_subscription_id&limit=20`,
  { headers },
);

if (!colRes.ok) {
  const err = await colRes.text();
  console.error("❌ Columna proximo_cobro NO disponible:", err);
  process.exit(1);
}

const empresas = await colRes.json();
console.log("✅ Migración 008: columna proximo_cobro existe");
console.log(`   Empresas encontradas: ${empresas.length}`);

for (const e of empresas) {
  const cobro = e.proximo_cobro
    ? new Date(e.proximo_cobro).toLocaleDateString("es-ES")
    : "—";
  console.log(
    `   · ${e.nombre_empresa}: estado=${e.estado_suscripcion}, plan=${e.plan ?? "sin plan"}, próximo cobro=${cobro}`,
  );
}

// 2. Rellenar proximo_cobro para activas sin fecha
const activasSinCobro = empresas.filter(
  (e) => e.estado_suscripcion === "active" && e.paypal_subscription_id && !e.proximo_cobro,
);

if (activasSinCobro.length === 0) {
  console.log("\n✅ Todas las suscripciones activas ya tienen proximo_cobro (o no hay activas).");
  process.exit(0);
}

console.log(`\n⏳ Rellenando proximo_cobro para ${activasSinCobro.length} empresa(s) desde PayPal…`);

const token = await getPayPalToken();
if (!token) {
  console.error("❌ No se pudo autenticar con PayPal para rellenar fechas");
  process.exit(1);
}

for (const e of activasSinCobro) {
  const subRes = await fetch(`${paypalBase}/v1/billing/subscriptions/${e.paypal_subscription_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const sub = await subRes.json();
  const next = sub.billing_info?.next_billing_time ?? null;

  if (!next) {
    console.log(`   ⚠ ${e.nombre_empresa}: PayPal no devolvió next_billing_time`);
    continue;
  }

  const patchRes = await fetch(`${supabaseUrl}/rest/v1/empresas?id=eq.${e.id}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ proximo_cobro: next }),
  });

  if (patchRes.ok) {
    console.log(
      `   ✅ ${e.nombre_empresa}: próximo cobro = ${new Date(next).toLocaleDateString("es-ES")}`,
    );
  } else {
    console.log(`   ❌ ${e.nombre_empresa}: error al guardar — ${await patchRes.text()}`);
  }
}

console.log("\nListo.");
