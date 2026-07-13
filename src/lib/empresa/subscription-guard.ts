import type { SupabaseClient } from "@supabase/supabase-js";
import {
  expireTrialIfNeeded,
  isSubscriptionUsable,
  type EmpresaSubscriptionFields,
} from "@/lib/empresa/subscription-access";

export async function isEmpresaActive(
  service: SupabaseClient,
  empresaId: string,
): Promise<boolean> {
  const { data } = await service
    .from("empresas")
    .select("estado_suscripcion, trial_ends_at, paypal_subscription_id")
    .eq("id", empresaId)
    .single();

  if (!data) return false;

  await expireTrialIfNeeded(service, empresaId, data);
  return isSubscriptionUsable({
    ...data,
    // Si acaba de expirar, reflejar pending para no depender de estado antiguo
    estado_suscripcion:
      !data.paypal_subscription_id &&
      data.trial_ends_at &&
      new Date(data.trial_ends_at) <= new Date()
        ? "pending"
        : data.estado_suscripcion,
  });
}

export function isEmpresaActiveSync(empresa: EmpresaSubscriptionFields): boolean {
  return isSubscriptionUsable(empresa);
}

export const READONLY_ERROR =
  "Tu cuenta está en solo lectura. Reactiva tu suscripción para hacer cambios.";
