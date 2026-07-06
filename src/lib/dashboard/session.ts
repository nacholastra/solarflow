import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DashboardContext = {
  userId: string;
  empresaId: string;
  empresaNombre: string;
  plan: string | null;
  rol: "admin" | "comercial";
};

type EquipoRow = {
  empresa_id: string;
  rol: "admin" | "comercial";
  empresas: { nombre_empresa: string; plan: string | null } | null;
};

/** Una sola consulta por request; deduplicada con React cache() entre layout y páginas. */
export const getDashboardContext = cache(async (): Promise<DashboardContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: equipo } = await supabase
    .from("equipo")
    .select("empresa_id, rol, empresas(nombre_empresa, plan)")
    .eq("usuario_id", user.id)
    .single();

  const row = equipo as EquipoRow | null;
  if (!row?.empresa_id) return null;

  return {
    userId: user.id,
    empresaId: row.empresa_id,
    empresaNombre: row.empresas?.nombre_empresa ?? "Mi empresa",
    plan: row.empresas?.plan ?? null,
    rol: row.rol,
  };
});

export async function requireDashboardContext(): Promise<DashboardContext> {
  const ctx = await getDashboardContext();
  if (!ctx) redirect("/login");
  return ctx;
}
