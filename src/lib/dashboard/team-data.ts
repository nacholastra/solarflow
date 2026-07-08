import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type TeamInvite = {
  email: string;
  expira_at: string;
  token: string;
};

export type TeamData = {
  invitaciones: TeamInvite[];
  miembros: number;
};

export const getTeamData = cache(async (empresaId: string): Promise<TeamData> => {
  const supabase = await createClient();
  const [{ data: invitaciones }, { count: miembros }] = await Promise.all([
    supabase
      .from("invitaciones_equipo")
      .select("email, expira_at, token")
      .eq("empresa_id", empresaId)
      .is("aceptada_at", null)
      .gt("expira_at", new Date().toISOString()),
    supabase.from("equipo").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId),
  ]);

  return {
    invitaciones: invitaciones ?? [],
    miembros: miembros ?? 0,
  };
});
