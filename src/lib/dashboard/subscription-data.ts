import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Empresa } from "@/types/database";

export type SubscriptionEmpresa = Pick<
  Empresa,
  | "id"
  | "plan"
  | "moneda_facturacion"
  | "estado_suscripcion"
  | "leads_limite_mes"
  | "leads_usados_mes"
  | "paypal_subscription_id"
  | "trial_ends_at"
> & {
  proximo_cobro: string | null;
  early_bird: boolean;
  early_bird_discount_pct: number | null;
};

export const getSubscriptionData = cache(
  async (empresaId: string): Promise<SubscriptionEmpresa | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("empresas")
      .select(
        "id, plan, moneda_facturacion, estado_suscripcion, leads_limite_mes, leads_usados_mes, paypal_subscription_id, proximo_cobro, trial_ends_at, early_bird, early_bird_discount_pct",
      )
      .eq("id", empresaId)
      .single();

    if (!data) return null;

    return {
      ...data,
      proximo_cobro: data.proximo_cobro ?? null,
      early_bird: Boolean(data.early_bird),
      early_bird_discount_pct: data.early_bird_discount_pct ?? null,
    } as SubscriptionEmpresa;
  },
);
