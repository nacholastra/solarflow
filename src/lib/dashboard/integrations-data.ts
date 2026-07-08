import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type IntegrationsData = {
  webhook_url: string;
  rol: string;
  plan: string | null;
};

export const getIntegrationsData = cache(
  async (empresaId: string, rol: string): Promise<IntegrationsData | null> => {
    const supabase = await createClient();
    const { data: empresa } = await supabase
      .from("empresas")
      .select("webhook_url, plan")
      .eq("id", empresaId)
      .single();

    if (!empresa) return null;

    return {
      webhook_url: empresa.webhook_url ?? "",
      rol,
      plan: empresa.plan,
    };
  },
);
