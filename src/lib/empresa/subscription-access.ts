import type { SupabaseClient } from "@supabase/supabase-js";

export type EmpresaSubscriptionFields = {
  estado_suscripcion: string;
  trial_ends_at?: string | null;
  paypal_subscription_id?: string | null;
};

/**
 * Acceso usable al producto:
 * - Suscripción PayPal activa, o
 * - Trial activo (fecha trial_ends_at en el futuro).
 * Sin PayPal y sin trial vigente → no usable (evita cuentas free eternas).
 */
export function isSubscriptionUsable(empresa: EmpresaSubscriptionFields): boolean {
  if (empresa.estado_suscripcion !== "active") return false;
  if (empresa.paypal_subscription_id) return true;
  if (!empresa.trial_ends_at) return false;
  return new Date(empresa.trial_ends_at).getTime() > Date.now();
}

export function isTrialActive(empresa: EmpresaSubscriptionFields): boolean {
  return (
    empresa.estado_suscripcion === "active" &&
    !empresa.paypal_subscription_id &&
    !!empresa.trial_ends_at &&
    new Date(empresa.trial_ends_at).getTime() > Date.now()
  );
}

export function isTrialExpired(empresa: EmpresaSubscriptionFields): boolean {
  return (
    !empresa.paypal_subscription_id &&
    !!empresa.trial_ends_at &&
    new Date(empresa.trial_ends_at).getTime() <= Date.now()
  );
}

export function getTrialDaysRemaining(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Pasa a pending cuando el trial acaba sin PayPal. Idempotente. */
export async function expireTrialIfNeeded(
  service: SupabaseClient,
  empresaId: string,
  empresa: EmpresaSubscriptionFields,
): Promise<boolean> {
  if (!isTrialExpired(empresa) || empresa.estado_suscripcion !== "active") {
    return false;
  }

  const { error } = await service
    .from("empresas")
    .update({ estado_suscripcion: "pending" })
    .eq("id", empresaId)
    .eq("estado_suscripcion", "active")
    .is("paypal_subscription_id", null);

  if (error) {
    console.error("expireTrialIfNeeded:", error.message);
    return false;
  }

  return true;
}

/** Expira todos los trials vencidos (cron / mantenimiento). */
export async function expireAllTrials(service: SupabaseClient): Promise<number> {
  const now = new Date().toISOString();
  const { data, error } = await service
    .from("empresas")
    .update({ estado_suscripcion: "pending" })
    .eq("estado_suscripcion", "active")
    .is("paypal_subscription_id", null)
    .not("trial_ends_at", "is", null)
    .lte("trial_ends_at", now)
    .select("id");

  if (error) {
    console.error("expireAllTrials:", error.message);
    return 0;
  }

  return data?.length ?? 0;
}
