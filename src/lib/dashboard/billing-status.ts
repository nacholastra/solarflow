import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getTrialDaysRemaining, isTrialActive } from "@/lib/empresa/subscription-access";

export type BillingStatus = {
  estado: "pending" | "active" | "suspended" | "cancelled";
  plan: "basic" | "pro" | null;
  proximoCobro: string | null;
  diasRestantes: number | null;
  onTrial: boolean;
  trialDaysRemaining: number | null;
  hasPaypal: boolean;
};

export const getBillingStatus = cache(async (empresaId: string): Promise<BillingStatus | null> => {
  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("estado_suscripcion, plan, proximo_cobro, trial_ends_at, paypal_subscription_id")
    .eq("id", empresaId)
    .single();

  if (!empresa) return null;

  const proximoCobro = empresa.proximo_cobro ?? null;
  let diasRestantes: number | null = null;
  if (proximoCobro) {
    const ms = new Date(proximoCobro).getTime() - Date.now();
    diasRestantes = Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  const hasPaypal = Boolean(empresa.paypal_subscription_id);
  const onTrial = isTrialActive(empresa);
  const trialDaysRemaining = onTrial ? getTrialDaysRemaining(empresa.trial_ends_at) : null;

  return {
    estado: empresa.estado_suscripcion,
    plan: empresa.plan,
    proximoCobro,
    diasRestantes,
    onTrial,
    trialDaysRemaining,
    hasPaypal,
  };
});
