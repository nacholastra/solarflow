import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { fetchInviteByToken, getInviteStatus } from "@/lib/team/invite";
import { isSameOrigin } from "@/lib/security/api-origin";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const { token } = await context.params;
    const limited = rateLimitResponse(request, `invite-accept:${token}`, 10, 60_000);
    if (limited) return limited;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para aceptar la invitación" }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Confirma tu email antes de unirte al equipo" },
        { status: 403 },
      );
    }

    const service = await createServiceClient();
    const invite = await fetchInviteByToken(service, token);
    const status = getInviteStatus(invite);

    if (status === "not_found") {
      return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
    }
    if (status === "expired") {
      return NextResponse.json({ error: "La invitación ha expirado" }, { status: 410 });
    }
    if (status === "already_accepted") {
      return NextResponse.json({ error: "Esta invitación ya fue aceptada" }, { status: 409 });
    }

    if (user.email?.toLowerCase() !== invite!.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Debes iniciar sesión con el email al que se envió la invitación" },
        { status: 403 },
      );
    }

    const { data: existingEquipo } = await service
      .from("equipo")
      .select("empresa_id")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (existingEquipo?.empresa_id === invite!.empresa_id) {
      return NextResponse.json({ error: "Ya eres miembro de este equipo" }, { status: 409 });
    }

    if (existingEquipo) {
      return NextResponse.json(
        { error: "Ya perteneces a otra empresa. Usa otra cuenta para aceptar esta invitación." },
        { status: 409 },
      );
    }

    const { error: equipoError } = await service.from("equipo").insert({
      empresa_id: invite!.empresa_id,
      usuario_id: user.id,
      rol: invite!.rol,
    });

    if (equipoError) {
      if (equipoError.message.includes("Límite de equipo")) {
        return NextResponse.json({ error: "El equipo ha alcanzado el límite de su plan" }, { status: 403 });
      }
      console.error("invite accept equipo error:", equipoError.message);
      return NextResponse.json({ error: "No se pudo unir al equipo" }, { status: 500 });
    }

    const { error: updateError } = await service
      .from("invitaciones_equipo")
      .update({ aceptada_at: new Date().toISOString() })
      .eq("id", invite!.id);

    if (updateError) {
      console.error("invite accept update error:", updateError.message);
    }

    return NextResponse.json({
      ok: true,
      empresaId: invite!.empresa_id,
      empresaNombre: invite!.empresas?.nombre_empresa ?? "Empresa",
    });
  } catch (e) {
    console.error("invite accept error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
