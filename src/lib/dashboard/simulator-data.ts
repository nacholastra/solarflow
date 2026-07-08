import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Empresa } from "@/types/database";

export type SimulatorEmpresa = Pick<
  Empresa,
  | "id"
  | "slug"
  | "nombre_empresa"
  | "color_marca"
  | "logo_url"
  | "privacy_url"
  | "precio_eur_kwp"
  | "tarifa_kwh_override"
  | "ratio_autoconsumo"
  | "kwp_max"
  | "gtm_id"
  | "estado_suscripcion"
  | "leads_usados_mes"
  | "leads_limite_mes"
  | "plan"
  | "updated_at"
>;

export const getSimulatorData = cache(
  async (empresaId: string): Promise<SimulatorEmpresa | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("empresas")
      .select(
        "id, slug, nombre_empresa, color_marca, logo_url, privacy_url, precio_eur_kwp, tarifa_kwh_override, ratio_autoconsumo, kwp_max, gtm_id, estado_suscripcion, leads_usados_mes, leads_limite_mes, plan, updated_at",
      )
      .eq("id", empresaId)
      .single();

    return (data as SimulatorEmpresa | null) ?? null;
  },
);
