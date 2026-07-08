import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { gastoToKwh } from "@/lib/solar/billing-es";
import { calcularSimulacion } from "@/lib/solar/calculator";
import type { Localidad, TipoInmueble } from "@/lib/solar/types";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { z } from "zod";

const leadSchema = z.object({
  empresa_slug: z.string().min(1).max(120),
  localidad_id: z.string().uuid(),
  tipo_inmueble: z.enum(["residencial", "comercial"]),
  nombre: z.string().min(2).max(120),
  email: z.string().email().max(254),
  telefono: z.string().min(9).max(20),
  gasto_mensual_eur: z.number().positive().optional(),
  consumo_kwh_mensual: z.number().positive().optional(),
  campo_origen_consumo: z.enum(["gasto", "kwh"]),
  consentimiento_rgpd: z.literal(true),
  website: z.string().optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  preview: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`leads:${ip}`, 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo más tarde." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 60) } },
      );
    }

    const json = await request.json();

    if (typeof json.website === "string" && json.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const parsed = leadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const data = parsed.data;
    const supabase = await createServiceClient();

    const { data: empresa } = await supabase
      .from("empresas")
      .select(
        "id, slug, estado_suscripcion, leads_usados_mes, leads_limite_mes, precio_eur_kwp, tarifa_kwh_override, ratio_autoconsumo, kwp_max",
      )
      .eq("slug", data.empresa_slug)
      .single();

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const isPreview = data.preview === true;

    if (isPreview) {
      const authClient = await createClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      const { data: equipo } = await authClient
        .from("equipo")
        .select("empresa_id")
        .eq("usuario_id", user.id)
        .eq("empresa_id", empresa.id)
        .single();
      if (!equipo) {
        return NextResponse.json({ error: "Sin permisos para modo prueba" }, { status: 403 });
      }
    } else if (empresa.estado_suscripcion !== "active") {
      return NextResponse.json({ error: "Empresa no encontrada o inactiva" }, { status: 403 });
    } else if (empresa.leads_usados_mes >= empresa.leads_limite_mes) {
      return NextResponse.json({ error: "Límite de leads alcanzado" }, { status: 402 });
    }

    const { data: locRow } = await supabase
      .from("localidades")
      .select("*")
      .eq("id", data.localidad_id)
      .single();

    if (!locRow) {
      return NextResponse.json({ error: "Localidad no válida" }, { status: 400 });
    }

    const localidad: Localidad = {
      id: locRow.id,
      nombre: locRow.nombre,
      slug: locRow.slug,
      provincia: locRow.provincia,
      ccaa: locRow.ccaa,
      lat: Number(locRow.lat),
      lon: Number(locRow.lon),
      produccion_kwh_kwp_anual: Number(locRow.produccion_kwh_kwp_anual),
      precio_energia_kwh: Number(locRow.precio_energia_kwh),
      peaje_te_kwh: Number(locRow.peaje_te_kwh),
      cargo_sistema_kwh: Number(locRow.cargo_sistema_kwh),
      precio_potencia_kw_mes: Number(locRow.precio_potencia_kw_mes),
      alquiler_contador_mes: Number(locRow.alquiler_contador_mes),
      potencia_tipica_residencial_kw: Number(locRow.potencia_tipica_residencial_kw),
      potencia_tipica_comercial_kw: Number(locRow.potencia_tipica_comercial_kw),
      usa_igic: locRow.usa_igic,
      iva_pct: Number(locRow.iva_pct),
      igic_energia_pct: Number(locRow.igic_energia_pct),
    };

    const kwhMensual =
      data.campo_origen_consumo === "gasto" && data.gasto_mensual_eur
        ? gastoToKwh(data.gasto_mensual_eur, localidad, data.tipo_inmueble as TipoInmueble)
        : (data.consumo_kwh_mensual ?? 0);

    const resultado = calcularSimulacion({
      localidad,
      tipoInmueble: data.tipo_inmueble as TipoInmueble,
      consumoKwhMensual: kwhMensual,
      empresaConfig: {
        precio_eur_kwp: Number(empresa.precio_eur_kwp),
        tarifa_kwh_override: empresa.tarifa_kwh_override
          ? Number(empresa.tarifa_kwh_override)
          : undefined,
        ratio_autoconsumo: Number(empresa.ratio_autoconsumo),
        kwp_max: Number(empresa.kwp_max),
      },
    });

    const { error } = await supabase.from("leads").insert({
      empresa_id: empresa.id,
      localidad_id: data.localidad_id,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      tipo_inmueble: data.tipo_inmueble,
      comunidad: localidad.ccaa,
      ciudad: localidad.nombre,
      gasto_mensual_eur: resultado.gasto_mensual_eur,
      consumo_kwh_mensual: resultado.consumo_kwh_mensual,
      campo_origen_consumo: data.campo_origen_consumo,
      precio_efectivo_kwh: resultado.precio_efectivo_kwh,
      desglose_factura: resultado.desglose_factura as unknown as import("@/types/database").Json,
      kwp_estimado: resultado.kwp_estimado,
      ahorro_anual_eur: resultado.ahorro_anual_eur,
      payback_anos: resultado.payback_anos,
      produccion_anual_kwh: resultado.produccion_anual_kwh,
      consentimiento_rgpd: true,
      es_prueba: isPreview,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
    });

    if (error) {
      if (error.message.includes("Límite de leads")) {
        return NextResponse.json({ error: "Límite de leads alcanzado" }, { status: 402 });
      }
      return NextResponse.json({ error: "No se pudo guardar el lead" }, { status: 500 });
    }

    return NextResponse.json({ resultado });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
