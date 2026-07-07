import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAllowedWebhookUrl, webhookUrlErrorMessage } from "@/lib/security/webhook-url";
import { canUseWebhooks } from "@/lib/config/plan-features";
import { z } from "zod";

const schema = z.object({
  webhook_url: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (val) => val === "" || isAllowedWebhookUrl(val),
      webhookUrlErrorMessage(),
    ),
});

export async function GET() {
  try {
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

    if (!equipo) {
      return NextResponse.json({ error: "Sin empresa" }, { status: 404 });
    }

    const { data: empresa } = await supabase
      .from("empresas")
      .select("id, webhook_url, plan")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      webhook_url: empresa.webhook_url ?? "",
      rol: equipo.rol,
      plan: empresa.plan,
    });
  } catch (e) {
    console.error("integrations GET error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "Solo el administrador puede configurar integraciones" },
        { status: 403 },
      );
    }

    const service = await createServiceClient();
    const { data: empresaRow } = await service
      .from("empresas")
      .select("id, plan")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresaRow) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    if (!canUseWebhooks(empresaRow.plan)) {
      return NextResponse.json(
        { error: "Las integraciones webhook requieren el plan Pro" },
        { status: 403 },
      );
    }

    const webhookUrl = body.webhook_url === "" ? null : body.webhook_url;
    const { data: empresa, error } = await service
      .from("empresas")
      .update({ webhook_url: webhookUrl })
      .eq("id", equipo.empresa_id)
      .select("id, webhook_url")
      .single();

    if (error || !empresa) {
      return NextResponse.json({ error: "No se pudo guardar la integración" }, { status: 500 });
    }

    return NextResponse.json({ webhook_url: empresa.webhook_url ?? "" });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message ?? "URL inválida" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 },
    );
  }
}
