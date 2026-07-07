import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getTeamLimit } from "@/lib/config/plan-features";
import { isSameOrigin } from "@/lib/security/api-origin";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const rate = checkRateLimit(`team-invite:${user.id}`, 20, 3_600_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiadas invitaciones. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 3600) } },
      );
    }

    const body = schema.parse(await request.json());

    const { data: equipo } = await supabase
      .from("equipo")
      .select("empresa_id, rol")
      .eq("usuario_id", user.id)
      .single();

    if (!equipo || equipo.rol !== "admin") {
      return NextResponse.json({ error: "Sin permisos para invitar" }, { status: 403 });
    }

    const service = await createServiceClient();
    const { data: empresa } = await service
      .from("empresas")
      .select("id, plan")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const teamLimit = getTeamLimit(empresa.plan);

    const [{ count: miembros }, { count: invitaciones }] = await Promise.all([
      service
        .from("equipo")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresa.id),
      service
        .from("invitaciones_equipo")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresa.id)
        .is("aceptada_at", null)
        .gt("expira_at", new Date().toISOString()),
    ]);

    const slotsUsed = (miembros ?? 0) + (invitaciones ?? 0);
    if (slotsUsed >= teamLimit) {
      return NextResponse.json(
        { error: `Tu plan permite hasta ${teamLimit} usuarios (incluyendo invitaciones pendientes).` },
        { status: 403 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const token = crypto.randomUUID();
    const expira = new Date();
    expira.setDate(expira.getDate() + 7);

    const { error } = await service.from("invitaciones_equipo").insert({
      empresa_id: empresa.id,
      email,
      rol: "comercial",
      token,
      expira_at: expira.toISOString(),
    });

    if (error) {
      if (error.message.includes("Límite de equipo")) {
        return NextResponse.json(
          { error: `Tu plan permite hasta ${teamLimit} usuarios.` },
          { status: 403 },
        );
      }
      console.error("team invite failed:", error.message);
      return NextResponse.json({ error: "No se pudo crear la invitación" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, token, invitePath: `/invite/${token}` });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    console.error("team invite error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
