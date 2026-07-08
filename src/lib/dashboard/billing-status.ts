import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type BillingStatus = {
  estado: "pending" | "active" | "suspended" | "cancelled";
  plan: "basic" | "pro" | null;
  proximoCobro: string | null;
  diasRestantes: number | null;
};

export const getBillingStatus = cache(async (empresaId: string): Promise<BillingStatus | null> => {
  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("estado_suscripcion, plan, proximo_cobro")
    .eq("id", empresaId)
    .single();

  if (!empresa) return null;

  const proximoCobro = empresa.proximo_cobro ?? null;
  let diasRestantes: number | null = null;
  if (proximoCobro) {
    const ms = new Date(proximoCobro).getTime() - Date.now();
    diasRestantes = Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  return {
    estado: empresa.estado_suscripcion,
    plan: empresa.plan,
    proximoCobro,
    diasRestantes,
  };
});
