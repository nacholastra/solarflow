import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedWebhookUrl, webhookUrlErrorMessage } from "@/lib/security/webhook-url";
import { z } from "zod";

const urlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((val) => isAllowedWebhookUrl(val), webhookUrlErrorMessage());

const bodySchema = z.object({
  webhook_url: urlSchema.optional(),
});

function buildSampleLead(empresaId: string) {
  const now = new Date().toISOString();
  return {
    id: "00000000-0000-4000-8000-000000000001",
    empresa_id: empresaId,
    localidad_id: null,
    fecha: now,
    nombre: "Lead de prueba SolarFlow",
    telefono: "+34600000000",
    email: "prueba@solarflow.test",
    tipo_inmueble: "residencial",
    comunidad: "Comunidad de Madrid",
    ciudad: "Madrid",
    gasto_luz: null,
    consumo_kwh: null,
    gasto_mensual_eur: 120,
    consumo_kwh_mensual: 350,
    campo_origen_consumo: "gasto",
    precio_efectivo_kwh: 0.34,
    desglose_factura: null,
    kwp_estimado: 4.2,
    ahorro_anual_eur: 850,
    payback_anos: 6.5,
    produccion_anual_kwh: 5800,
    estado: "Nuevo",
    assigned_to: null,
    notas: "Lead de prueba enviado desde el panel de integraciones",
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    consentimiento_rgpd: true,
    ip_hash: null,
    created_at: now,
    updated_at: now,
  };
}

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

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
        { error: "Solo el administrador puede probar el webhook" },
        { status: 403 },
      );
    }

    const { data: empresa } = await supabase
      .from("empresas")
      .select("id, webhook_url")
      .eq("id", equipo.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const targetUrl = parsed.data.webhook_url?.trim() || empresa.webhook_url?.trim();
    if (!targetUrl) {
      return NextResponse.json(
        { error: "Configura una URL de webhook antes de probar" },
        { status: 400 },
      );
    }

    if (!isAllowedWebhookUrl(targetUrl)) {
      return NextResponse.json({ error: webhookUrlErrorMessage() }, { status: 400 });
    }

    const payload = {
      event: "lead.created",
      test: true,
      lead: buildSampleLead(empresa.id),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "SolarFlow-Webhook/1.0",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return NextResponse.json(
          { error: "Tiempo de espera agotado (15 s). Comprueba la URL del webhook." },
          { status: 504 },
        );
      }
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "No se pudo conectar con el webhook" },
        { status: 502 },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `El webhook respondió con error HTTP ${response.status}`,
          status: response.status,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: response.status,
      message: "Lead de prueba enviado correctamente",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
