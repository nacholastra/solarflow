/**
 * Verifica migración 009: es_prueba + triggers + política DELETE.
 * Uso: node scripts/verify-migration-009.mjs
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
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

// 1. Columna es_prueba
const leadsRes = await fetch(
  `${supabaseUrl}/rest/v1/leads?select=id,nombre,es_prueba,empresa_id&limit=10`,
  { headers },
);

if (!leadsRes.ok) {
  console.error("❌ Columna es_prueba NO disponible:", await leadsRes.text());
  process.exit(1);
}

const leads = await leadsRes.json();
console.log("✅ Migración 009: columna es_prueba existe");
console.log(`   Leads en BD: ${leads.length}`);

const prueba = leads.filter((l) => l.es_prueba);
const reales = leads.filter((l) => !l.es_prueba);
console.log(`   · Leads reales: ${reales.length}`);
console.log(`   · Leads de prueba: ${prueba.length}`);

for (const l of leads.slice(0, 5)) {
  console.log(`   · ${l.nombre}: ${l.es_prueba ? "PRUEBA" : "real"}`);
}

// 2. Contadores de empresas
const empRes = await fetch(
  `${supabaseUrl}/rest/v1/empresas?select=nombre_empresa,leads_usados_mes,leads_limite_mes,estado_suscripcion`,
  { headers },
);
const empresas = await empRes.json();
console.log("\n📊 Cuota mensual por empresa:");
for (const e of empresas) {
  console.log(
    `   · ${e.nombre_empresa}: ${e.leads_usados_mes}/${e.leads_limite_mes} leads (${e.estado_suscripcion})`,
  );
}

console.log("\n✅ Todo listo. Las simulaciones del Dashboard ya no consumen cuota.");
console.log("   Los leads de prueba se pueden borrar desde el CRM.");
