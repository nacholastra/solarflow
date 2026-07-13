import { cache } from "react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  expireTrialIfNeeded,
  getTrialDaysRemaining,
  isTrialActive,
} from "@/lib/empresa/subscription-access";

export type BillingStatus = {
  estado: "pending" | "active" | "suspended" | "cancelled";
  plan: "basic" | "pro" | null;
  proximoCobro: string | null;
  diasRestantes: number | null;
  onTrial: boolean;
  trialDaysRemaining: number | null;
  hasPaypal: boolean;
  earlyBird: boolean;
  earlyBirdDiscountPct: number | null;
};

export const getBillingStatus = cache(async (empresaId: string): Promise<BillingStatus | null> => {
  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select(
      "estado_suscripcion, plan, proximo_cobro, trial_ends_at, paypal_subscription_id, early_bird, early_bird_discount_pct",
    )
    .eq("id", empresaId)
    .single();

  if (!empresa) return null;

  // Cierra el trial en BD si ya venció (dashboard siempre ve estado real).
  if (
    empresa.estado_suscripcion === "active" &&
    !empresa.paypal_subscription_id &&
    empresa.trial_ends_at &&
    new Date(empresa.trial_ends_at) <= new Date()
  ) {
    try {
      const service = await createServiceClient();
      await expireTrialIfNeeded(service, empresaId, empresa);
      empresa.estado_suscripcion = "pending";
    } catch (e) {
      console.warn("getBillingStatus expire trial:", e);
    }
  }

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
    earlyBird: Boolean(empresa.early_bird),
    earlyBirdDiscountPct: empresa.early_bird_discount_pct ?? null,
  };
});
