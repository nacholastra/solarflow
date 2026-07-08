import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { createAnonAuthClient, fetchInviteByToken, getInviteStatus } from "@/lib/team/invite";
import { getSiteUrl } from "@/lib/config/site";
import { PLANS } from "@/lib/config/plans";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  nombre_empresa: z.string().min(2).max(120).optional(),
  plan: z.enum(["basic", "pro"]).optional(),
  invite_token: z.string().uuid().optional(),
});

function mapSignUpError(message: string | undefined): string {
  const msg = (message ?? "").toLowerCase();
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "Ya existe una cuenta con ese email. Inicia sesión.";
  }
  if (msg.includes("rate limit") || msg.includes("too many") || msg.includes("email rate")) {
    return "Se alcanzó el límite de envío de emails. Espera unos minutos e inténtalo de nuevo.";
  }
  if (msg.includes("sending") && msg.includes("email")) {
    return "No se pudo enviar el email de confirmación. Revisa la configuración de correo (SMTP) en Supabase.";
  }
  if (msg.includes("password")) {
    return "La contraseña no cumple los requisitos mínimos.";
  }
  if (msg.includes("signup") && msg.includes("disabled")) {
    return "El registro está deshabilitado en este momento.";
  }
  return "No se pudo crear la cuenta. Inténtalo de nuevo.";
}

export async function POST(request: Request) {
  try {
    const limited = rateLimitResponse(request, "auth-register", 5, 3_600_000);
    if (limited) return limited;

    const ip = getClientIp(request);
    const rate = checkRateLimit(`register:${ip}`, 5, 3_600_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos de registro. Inténtalo más tarde." },
        { status: 429 },
      );
    }

    const body = schema.parse(await request.json());
    const service = await createServiceClient();
    const anon = createAnonAuthClient();
    const redirectTo = `${getSiteUrl()}/auth/callback?next=/dashboard/subscription`;

    if (body.invite_token) {
      const invite = await fetchInviteByToken(service, body.invite_token);
      const status = getInviteStatus(invite);

      if (status !== "valid") {
        return NextResponse.json({ error: "Invitación no válida o expirada" }, { status: 400 });
      }

      if (body.email.toLowerCase() !== invite!.email.toLowerCase()) {
        return NextResponse.json(
          { error: "Debes registrarte con el email de la invitación" },
          { status: 400 },
        );
      }

      const { data: authData, error: authError } = await anon.auth.signUp({
        email: body.email,
        password: body.password,
        options: { emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/invite/${body.invite_token}` },
      });

      if (authError || !authData.user) {
        console.error("register signUp error (invite):", authError?.message);
        return NextResponse.json({ error: mapSignUpError(authError?.message) }, { status: 400 });
      }

      if (authData.user.identities && authData.user.identities.length === 0) {
        return NextResponse.json(
          { error: "Ya existe una cuenta con ese email. Inicia sesión." },
          { status: 409 },
        );
      }

      const { error: equipoError } = await service.from("equipo").insert({
        empresa_id: invite!.empresa_id,
        usuario_id: authData.user.id,
        rol: invite!.rol,
      });

      if (equipoError) {
        await service.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: "No se pudo unir al equipo" }, { status: 500 });
      }

      await service
        .from("invitaciones_equipo")
        .update({ aceptada_at: new Date().toISOString() })
        .eq("id", invite!.id);

      return NextResponse.json({
        ok: true,
        requiresEmailConfirmation: !authData.session,
        invitePath: `/invite/${body.invite_token}`,
      });
    }

    if (!body.nombre_empresa) {
      return NextResponse.json({ error: "Nombre de empresa requerido" }, { status: 400 });
    }

    if (!body.plan) {
      return NextResponse.json({ error: "Debes elegir un plan" }, { status: 400 });
    }

    const slug = slugify(body.nombre_empresa);

    const { data: existingSlug } = await service
      .from("empresas")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: "Ya existe una empresa con un nombre similar. Prueba otro nombre." },
        { status: 409 },
      );
    }

    const { data: authData, error: authError } = await anon.auth.signUp({
      email: body.email,
      password: body.password,
      options: { emailRedirectTo: redirectTo },
    });

    if (authError || !authData.user) {
      console.error("register signUp error:", authError?.message);
      return NextResponse.json({ error: mapSignUpError(authError?.message) }, { status: 400 });
    }

    if (authData.user.identities && authData.user.identities.length === 0) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email. Inicia sesión." },
        { status: 409 },
      );
    }

    const { data: empresa, error: empresaError } = await service
      .from("empresas")
      .insert({
        owner_id: authData.user.id,
        nombre_empresa: body.nombre_empresa,
        slug,
        plan: body.plan,
        leads_limite_mes: PLANS[body.plan].leadsLimit,
        estado_suscripcion: "pending",
      })
      .select("id")
      .single();

    if (empresaError || !empresa) {
      await service.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "No se pudo crear la empresa" }, { status: 500 });
    }

    const { error: equipoError } = await service.from("equipo").insert({
      empresa_id: empresa.id,
      usuario_id: authData.user.id,
      rol: "admin",
    });

    if (equipoError) {
      await service.from("empresas").delete().eq("id", empresa.id);
      await service.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "No se pudo configurar el equipo" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      requiresEmailConfirmation: !authData.session,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error("register error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
