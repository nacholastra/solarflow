import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardContext } from "@/lib/dashboard/session";

export type ProfileData = {
  empresa: {
    id: string;
    nombre_empresa: string;
    slug: string;
    plan: "basic" | "pro" | null;
    estado_suscripcion: string;
    moneda_facturacion: string;
    leads_limite_mes: number;
    leads_usados_mes: number;
    created_at: string;
  };
  email: string | undefined;
  rol: string;
};

export const getProfileData = cache(async (): Promise<ProfileData | null> => {
  const context = await getDashboardContext();
  if (!context) return null;

  const supabase = await createClient();
  const [{ data: empresa }, { data: { user } }] = await Promise.all([
    supabase
      .from("empresas")
      .select(
        "id, nombre_empresa, slug, plan, estado_suscripcion, moneda_facturacion, leads_limite_mes, leads_usados_mes, created_at",
      )
      .eq("id", context.empresaId)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!empresa) return null;

  return {
    empresa,
    email: user?.email,
    rol: context.rol,
  };
});
