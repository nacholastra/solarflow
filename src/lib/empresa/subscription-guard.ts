import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Comprueba si una empresa tiene la suscripción activa.
 * Cuando no lo está, la cuenta queda en modo solo lectura.
 */
export async function isEmpresaActive(
  service: SupabaseClient,
  empresaId: string,
): Promise<boolean> {
  const { data } = await service
    .from("empresas")
    .select("estado_suscripcion")
    .eq("id", empresaId)
    .single();
  return data?.estado_suscripcion === "active";
}

export const READONLY_ERROR =
  "Tu cuenta está en solo lectura. Reactiva tu suscripción para hacer cambios.";
