import type { SupabaseClient } from "@supabase/supabase-js";

export type EmpresaSubscriptionFields = {
  estado_suscripcion: string;
  trial_ends_at?: string | null;
  paypal_subscription_id?: string | null;
};

export function isSubscriptionUsable(empresa: EmpresaSubscriptionFields): boolean {
  if (empresa.estado_suscripcion !== "active") return false;
  if (empresa.paypal_subscription_id) return true;
  if (!empresa.trial_ends_at) return true;
  return new Date(empresa.trial_ends_at) > new Date();
}

export function isTrialActive(empresa: EmpresaSubscriptionFields): boolean {
  return (
    empresa.estado_suscripcion === "active" &&
    !empresa.paypal_subscription_id &&
    !!empresa.trial_ends_at &&
    new Date(empresa.trial_ends_at) > new Date()
  );
}

export function getTrialDaysRemaining(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export async function expireTrialIfNeeded(
  service: SupabaseClient,
  empresaId: string,
  empresa: EmpresaSubscriptionFields,
): Promise<void> {
  if (
    empresa.estado_suscripcion === "active" &&
    !empresa.paypal_subscription_id &&
    empresa.trial_ends_at &&
    new Date(empresa.trial_ends_at) <= new Date()
  ) {
    await service
      .from("empresas")
      .update({ estado_suscripcion: "pending", trial_ends_at: null })
      .eq("id", empresaId);
  }
}
