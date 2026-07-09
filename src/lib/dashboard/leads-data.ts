import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types/database";

import { LEAD_SELECT_COLUMNS } from "@/lib/dashboard/lead-columns";

export const fetchLeadsForEmpresa = cache(async (empresaId: string): Promise<Lead[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT_COLUMNS)
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Lead[];
});
