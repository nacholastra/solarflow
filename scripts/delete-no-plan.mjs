import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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
const service = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: empresas, error } = await service
  .from("empresas")
  .select("id, nombre_empresa, plan")
  .is("plan", null);

if (error) {
  console.error("Error al consultar empresas:", error.message);
  process.exit(1);
}

if (!empresas || empresas.length === 0) {
  console.log("No hay empresas sin plan. Nada que borrar.");
  process.exit(0);
}

console.log(`Empresas sin plan encontradas: ${empresas.length}`);

let deletedEmpresas = 0;
let deletedUsers = 0;

for (const empresa of empresas) {
  const { data: miembros } = await service
    .from("equipo")
    .select("usuario_id")
    .eq("empresa_id", empresa.id);

  const userIds = new Set((miembros ?? []).map((m) => m.usuario_id));

  const { error: delErr } = await service.from("empresas").delete().eq("id", empresa.id);
  if (delErr) {
    console.error(`  ✗ ${empresa.nombre_empresa}: ${delErr.message}`);
    continue;
  }
  deletedEmpresas += 1;

  for (const uid of userIds) {
    const { error: uErr } = await service.auth.admin.deleteUser(uid);
    if (!uErr) deletedUsers += 1;
  }

  console.log(`  ✓ ${empresa.nombre_empresa} (usuarios: ${userIds.size})`);
}

console.log(`\nHecho. Empresas borradas: ${deletedEmpresas}. Usuarios borrados: ${deletedUsers}.`);
