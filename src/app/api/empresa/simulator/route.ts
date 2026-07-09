import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { canUseGtm } from "@/lib/config/plan-features";
import { isEmpresaActive, READONLY_ERROR } from "@/lib/empresa/subscription-guard";
import { isSameOrigin } from "@/lib/security/api-origin";
import { rateLimitResponse } from "@/lib/security/api-rate-limit";
import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color HEX inválido");

const schema = z.object({
  color_marca: hexColor,
  logo_url: z.union([z.literal(""), z.string().url().max(2048)]),
  privacy_url: z.union([z.literal(""), z.string().url().max(2048)]),
  precio_eur_kwp: z.number().min(500).max(5000),
  ratio_autoconsumo: z.number().min(0).max(1),
  kwp_max: z.number().min(1).max(500),
  gtm_id: z.union([z.literal(""), z.string().regex(/^GTM-[A-Z0-9]+$/)]).optional(),
});

export async function PATCH(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const limited = rateLimitResponse(request, "empresa-simulator", 30, 60_000);
    if (limited) return limited;

    const body = schema.parse(await request.json());

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: equipo } = await supabase
      .from("equipo")
      .select("empresa_id, rol")
      .eq("usuario_id", user.id)
      .single();

    if (!equipo || equipo.rol !== "admin") {
      return NextResponse.json({ error: "Solo el administrador puede editar el simulador" }, { status: 403 });
    }

    const service = await createServiceClient();
    if (!(await isEmpresaActive(service, equipo.empresa_id))) {
      return NextResponse.json({ error: READONLY_ERROR }, { status: 403 });
    }

    const { data: empresa } = await service
      .from("empresas")
      .select("plan")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const payload: Record<string, unknown> = {
      color_marca: body.color_marca,
      logo_url: body.logo_url === "" ? null : body.logo_url,
      privacy_url: body.privacy_url === "" ? null : body.privacy_url,
      precio_eur_kwp: body.precio_eur_kwp,
      ratio_autoconsumo: body.ratio_autoconsumo,
      kwp_max: body.kwp_max,
    };

    if (canUseGtm(empresa.plan) && body.gtm_id !== undefined) {
      payload.gtm_id = body.gtm_id === "" ? null : body.gtm_id;
    }

    const { error } = await service.from("empresas").update(payload).eq("id", equipo.empresa_id);

    if (error) {
      return NextResponse.json({ error: "No se pudo guardar la configuración" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message ?? "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
