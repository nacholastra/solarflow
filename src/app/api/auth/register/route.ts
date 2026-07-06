import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  nombre_empresa: z.string().min(2).max(120),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`register:${ip}`, 5, 3_600_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos de registro. Inténtalo más tarde." },
        { status: 429 },
      );
    }

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
      return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 400 });
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
      return NextResponse.json({ error: "No se pudo crear la empresa" }, { status: 500 });
    }

    const { error: equipoError } = await supabase.from("equipo").insert({
      empresa_id: empresa.id,
      usuario_id: authData.user.id,
      rol: "admin",
    });

    if (equipoError) {
      await supabase.from("empresas").delete().eq("id", empresa.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "No se pudo configurar el equipo" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
