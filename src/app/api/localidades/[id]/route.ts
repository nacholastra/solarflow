import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();
    const { data, error } = await supabase.from("localidades").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: data.id,
      nombre: data.nombre,
      slug: data.slug,
      provincia: data.provincia,
      ccaa: data.ccaa,
      lat: Number(data.lat),
      lon: Number(data.lon),
      produccion_kwh_kwp_anual: Number(data.produccion_kwh_kwp_anual),
      precio_energia_kwh: Number(data.precio_energia_kwh),
      peaje_te_kwh: Number(data.peaje_te_kwh),
      cargo_sistema_kwh: Number(data.cargo_sistema_kwh),
      precio_potencia_kw_mes: Number(data.precio_potencia_kw_mes),
      alquiler_contador_mes: Number(data.alquiler_contador_mes),
      potencia_tipica_residencial_kw: Number(data.potencia_tipica_residencial_kw),
      potencia_tipica_comercial_kw: Number(data.potencia_tipica_comercial_kw),
      usa_igic: data.usa_igic,
      iva_pct: Number(data.iva_pct),
      igic_energia_pct: Number(data.igic_energia_pct),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 },
    );
  }
}
