import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types/database";

const LEAD_COLUMNS =
  "id, empresa_id, nombre, email, telefono, ciudad, comunidad, tipo_inmueble, estado, kwp_estimado, ahorro_anual_eur, payback_anos, notas, es_prueba, created_at, updated_at";

export const fetchLeadsForEmpresa = cache(async (empresaId: string): Promise<Lead[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Lead[];
});
