"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/types/database";

const LEAD_COLUMNS =
  "id, empresa_id, nombre, email, telefono, ciudad, estado, kwp_estimado, ahorro_anual_eur, notas, created_at, updated_at";

export function leadsQueryKey(empresaId: string) {
  return ["leads", empresaId] as const;
}

async function fetchLeads(empresaId: string): Promise<Lead[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Lead[];
}

export function useLeads(empresaId: string) {
  return useQuery({
    queryKey: leadsQueryKey(empresaId),
    queryFn: () => fetchLeads(empresaId),
    staleTime: 30_000,
  });
}

export function useInvalidateLeads() {
  const queryClient = useQueryClient();
  return (empresaId: string) =>
    queryClient.invalidateQueries({ queryKey: leadsQueryKey(empresaId) });
}
