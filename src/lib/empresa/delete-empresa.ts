import type { SupabaseClient } from "@supabase/supabase-js";
import { cancelPayPalSubscription } from "@/lib/paypal/client";

/**
 * Elimina empresa, datos asociados (cascade) y usuarios auth del equipo.
 * Requiere service role.
 */
export async function deleteEmpresaCompletely(
  service: SupabaseClient,
  empresaId: string,
): Promise<{ deletedUsers: number }> {
  const { data: empresa, error: fetchError } = await service
    .from("empresas")
    .select("id, owner_id, paypal_subscription_id")
    .eq("id", empresaId)
    .single();

  if (fetchError || !empresa) {
    throw new Error("Empresa no encontrada");
  }

  if (empresa.paypal_subscription_id) {
    await cancelPayPalSubscription(empresa.paypal_subscription_id);
  }

  const { data: miembros } = await service
    .from("equipo")
    .select("usuario_id")
    .eq("empresa_id", empresaId);

  const userIds = new Set<string>([empresa.owner_id]);
  for (const m of miembros ?? []) {
    userIds.add(m.usuario_id);
  }

  const { error: deleteError } = await service.from("empresas").delete().eq("id", empresaId);
  if (deleteError) {
    throw new Error("No se pudo eliminar la empresa");
  }

  let deletedUsers = 0;
  for (const userId of userIds) {
    const { error } = await service.auth.admin.deleteUser(userId);
    if (!error) deletedUsers += 1;
    else console.error(`deleteUser ${userId}:`, error.message);
  }

  return { deletedUsers };
}
