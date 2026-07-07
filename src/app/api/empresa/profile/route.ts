import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  nombre_empresa: z.string().min(2).max(120),
});

export async function PATCH(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: equipo } = await supabase
      .from("equipo")
      .select("empresa_id, rol")
      .eq("usuario_id", user.id)
      .single();

    if (!equipo || equipo.rol !== "admin") {
      return NextResponse.json({ error: "Solo el administrador puede editar el perfil" }, { status: 403 });
    }

    const slug = slugify(body.nombre_empresa);
    const service = await createServiceClient();

    const { data: existing } = await service
      .from("empresas")
      .select("id")
      .eq("slug", slug)
      .neq("id", equipo.empresa_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe otra empresa con un nombre similar. Prueba otro nombre." },
        { status: 409 },
      );
    }

    const { data: empresa, error } = await service
      .from("empresas")
      .update({
        nombre_empresa: body.nombre_empresa,
        slug,
      })
      .eq("id", equipo.empresa_id)
      .select("id, nombre_empresa, slug, plan, estado_suscripcion, moneda_facturacion")
      .single();

    if (error || !empresa) {
      return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
    }

    return NextResponse.json({ empresa, email: user.email });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Nombre de empresa inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: equipo } = await supabase
      .from("equipo")
      .select("empresa_id, rol")
      .eq("usuario_id", user.id)
      .single();

    if (!equipo) {
      return NextResponse.json({ error: "Sin empresa" }, { status: 404 });
    }

    const { data: empresa } = await supabase
      .from("empresas")
      .select("id, nombre_empresa, slug, plan, estado_suscripcion, moneda_facturacion, leads_limite_mes, leads_usados_mes, created_at")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      empresa,
      email: user.email,
      rol: equipo.rol,
    });
  } catch (e) {
    console.error("profile GET error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
