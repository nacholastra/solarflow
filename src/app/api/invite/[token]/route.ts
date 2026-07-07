import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchInviteByToken, getInviteStatus } from "@/lib/team/invite";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const limited = rateLimitResponse(request, `invite-get:${token}`, 30, 60_000);
    if (limited) return limited;

    const service = await createServiceClient();
    const invite = await fetchInviteByToken(service, token);
    const status = getInviteStatus(invite);

    if (status === "not_found") {
      return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      status,
      email: invite!.email,
      rol: invite!.rol,
      empresaNombre: invite!.empresas?.nombre_empresa ?? "Empresa",
      expiraAt: invite!.expira_at,
    });
  } catch (e) {
    console.error("invite GET error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
