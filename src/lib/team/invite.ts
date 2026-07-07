import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type InviteRow = {
  id: string;
  empresa_id: string;
  email: string;
  rol: "admin" | "comercial";
  token: string;
  expira_at: string;
  aceptada_at: string | null;
  empresas: { nombre_empresa: string } | null;
};

export type InviteStatus = "valid" | "not_found" | "expired" | "already_accepted";

export function getInviteStatus(invite: InviteRow | null): InviteStatus {
  if (!invite) return "not_found";
  if (invite.aceptada_at) return "already_accepted";
  if (new Date(invite.expira_at) <= new Date()) return "expired";
  return "valid";
}

export async function fetchInviteByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<InviteRow | null> {
  const { data } = await supabase
    .from("invitaciones_equipo")
    .select("id, empresa_id, email, rol, token, expira_at, aceptada_at, empresas(nombre_empresa)")
    .eq("token", token)
    .maybeSingle();

  return data as InviteRow | null;
}

export function createAnonAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase no configurado");
  return createClient(url, key);
}
