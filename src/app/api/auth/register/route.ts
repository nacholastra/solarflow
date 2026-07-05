import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre_empresa: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const supabase = await createServiceClient();
    const slug = slugify(body.nombre_empresa);

    const { data: existingSlug } = await supabase
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

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? "No se pudo crear el usuario" },
        { status: 400 },
      );
    }

    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .insert({
        owner_id: authData.user.id,
        nombre_empresa: body.nombre_empresa,
        slug,
        estado_suscripcion: "pending",
      })
      .select("id")
      .single();

    if (empresaError || !empresa) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: empresaError?.message ?? "No se pudo crear la empresa" },
        { status: 500 },
      );
    }

    const { error: equipoError } = await supabase.from("equipo").insert({
      empresa_id: empresa.id,
      usuario_id: authData.user.id,
      rol: "admin",
    });

    if (equipoError) {
      await supabase.from("empresas").delete().eq("id", empresa.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: equipoError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
