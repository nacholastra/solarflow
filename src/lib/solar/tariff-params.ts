import type { SupabaseClient } from "@supabase/supabase-js";

export type TariffEstado = "draft" | "active" | "archived";

export type TariffParams = {
  id: string;
  periodo: string;
  precio_energia_medio: number;
  peaje_te_medio: number;
  cargo_sistema_medio: number;
  precio_potencia_kw_mes: number;
  alquiler_contador_mes: number;
  iee_pct: number;
  iva_pct: number;
  precio_vertido_factor: number;
  estado: TariffEstado;
  fuente: string | null;
  notas: string | null;
  propuesta_automatica: boolean;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TariffInput = {
  periodo: string;
  precio_energia_medio: number;
  peaje_te_medio: number;
  cargo_sistema_medio: number;
  precio_potencia_kw_mes: number;
  alquiler_contador_mes: number;
  iee_pct: number;
  iva_pct: number;
  precio_vertido_factor: number;
  fuente?: string | null;
  notas?: string | null;
  propuesta_automatica?: boolean;
};

export function currentPeriodo(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function mapRow(row: Record<string, unknown>): TariffParams {
  return {
    id: String(row.id),
    periodo: String(row.periodo),
    precio_energia_medio: Number(row.precio_energia_medio),
    peaje_te_medio: Number(row.peaje_te_medio),
    cargo_sistema_medio: Number(row.cargo_sistema_medio),
    precio_potencia_kw_mes: Number(row.precio_potencia_kw_mes),
    alquiler_contador_mes: Number(row.alquiler_contador_mes),
    iee_pct: Number(row.iee_pct),
    iva_pct: Number(row.iva_pct),
    precio_vertido_factor: Number(row.precio_vertido_factor),
    estado: row.estado as TariffEstado,
    fuente: (row.fuente as string | null) ?? null,
    notas: (row.notas as string | null) ?? null,
    propuesta_automatica: Boolean(row.propuesta_automatica),
    activated_at: (row.activated_at as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function getActiveTariff(
  service: SupabaseClient,
): Promise<TariffParams | null> {
  const { data, error } = await service
    .from("parametros_tarifa")
    .select("*")
    .eq("estado", "active")
    .maybeSingle();

  if (error) {
    console.error("getActiveTariff:", error.message);
    return null;
  }
  return data ? mapRow(data) : null;
}

export async function listTariffs(service: SupabaseClient): Promise<TariffParams[]> {
  const { data, error } = await service
    .from("parametros_tarifa")
    .select("*")
    .order("periodo", { ascending: false });

  if (error) {
    console.error("listTariffs:", error.message);
    return [];
  }
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

/** Propaga el periodo activo (o uno dado) a todas las localidades. Respeta IGIC en Canarias. */
export async function propagateTariffToLocalidades(
  service: SupabaseClient,
  tariffId?: string,
): Promise<{ updated: number }> {
  let tariff: TariffParams | null = null;

  if (tariffId) {
    const { data } = await service.from("parametros_tarifa").select("*").eq("id", tariffId).single();
    tariff = data ? mapRow(data as Record<string, unknown>) : null;
  } else {
    tariff = await getActiveTariff(service);
  }

  if (!tariff) {
    throw new Error("No hay periodo de tarifa para propagar");
  }

  const { data: locs, error: locErr } = await service
    .from("localidades")
    .select("id, usa_igic, iva_pct");

  if (locErr) throw new Error(locErr.message);

  let updated = 0;
  for (const loc of locs ?? []) {
    const { error } = await service
      .from("localidades")
      .update({
        precio_energia_kwh: tariff.precio_energia_medio,
        peaje_te_kwh: tariff.peaje_te_medio,
        cargo_sistema_kwh: tariff.cargo_sistema_medio,
        precio_potencia_kw_mes: tariff.precio_potencia_kw_mes,
        alquiler_contador_mes: tariff.alquiler_contador_mes,
        iva_pct: loc.usa_igic ? loc.iva_pct : tariff.iva_pct,
        iee_pct: tariff.iee_pct,
        precio_vertido_factor: tariff.precio_vertido_factor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loc.id);

    if (!error) updated += 1;
  }

  return { updated };
}

export async function createDraftTariff(
  service: SupabaseClient,
  input: TariffInput,
): Promise<TariffParams> {
  const { data: existing } = await service
    .from("parametros_tarifa")
    .select("*")
    .eq("periodo", input.periodo)
    .maybeSingle();

  if (existing && (existing as { estado: string }).estado === "active") {
    throw new Error(
      `El periodo ${input.periodo} ya está activo. Crea otro periodo o archívalo antes.`,
    );
  }

  if (existing) {
    const { data, error } = await service
      .from("parametros_tarifa")
      .update({
        precio_energia_medio: input.precio_energia_medio,
        peaje_te_medio: input.peaje_te_medio,
        cargo_sistema_medio: input.cargo_sistema_medio,
        precio_potencia_kw_mes: input.precio_potencia_kw_mes,
        alquiler_contador_mes: input.alquiler_contador_mes,
        iee_pct: input.iee_pct,
        iva_pct: input.iva_pct,
        precio_vertido_factor: input.precio_vertido_factor,
        estado: "draft",
        fuente: input.fuente ?? null,
        notas: input.notas ?? null,
        propuesta_automatica: input.propuesta_automatica ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (existing as { id: string }).id)
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message ?? "No se pudo actualizar el borrador");
    return mapRow(data as Record<string, unknown>);
  }

  const { data, error } = await service
    .from("parametros_tarifa")
    .insert({
      periodo: input.periodo,
      precio_energia_medio: input.precio_energia_medio,
      peaje_te_medio: input.peaje_te_medio,
      cargo_sistema_medio: input.cargo_sistema_medio,
      precio_potencia_kw_mes: input.precio_potencia_kw_mes,
      alquiler_contador_mes: input.alquiler_contador_mes,
      iee_pct: input.iee_pct,
      iva_pct: input.iva_pct,
      precio_vertido_factor: input.precio_vertido_factor,
      estado: "draft",
      fuente: input.fuente ?? null,
      notas: input.notas ?? null,
      propuesta_automatica: input.propuesta_automatica ?? false,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el borrador");
  }

  return mapRow(data as Record<string, unknown>);
}

export async function activateTariff(
  service: SupabaseClient,
  tariffId: string,
): Promise<{ tariff: TariffParams; updatedLocalidades: number }> {
  const { data: target, error: targetErr } = await service
    .from("parametros_tarifa")
    .select("*")
    .eq("id", tariffId)
    .single();

  if (targetErr || !target) {
    throw new Error(targetErr?.message ?? "Periodo no encontrado");
  }

  // Archivar el activo actual
  await service
    .from("parametros_tarifa")
    .update({ estado: "archived", updated_at: new Date().toISOString() })
    .eq("estado", "active")
    .neq("id", tariffId);

  const { data: activated, error: actErr } = await service
    .from("parametros_tarifa")
    .update({
      estado: "active",
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", tariffId)
    .select("*")
    .single();

  if (actErr || !activated) {
    throw new Error(actErr?.message ?? "No se pudo activar el periodo");
  }

  const { updated } = await propagateTariffToLocalidades(service, tariffId);
  return { tariff: mapRow(activated as Record<string, unknown>), updatedLocalidades: updated };
}

/**
 * Crea borrador del mes actual a partir del activo (o defaults).
 * No activa. El admin debe revisar y publicar.
 */
export async function proposeMonthlyDraft(
  service: SupabaseClient,
  options?: { energyOverride?: number },
): Promise<{ created: boolean; tariff: TariffParams | null; reason?: string }> {
  const periodo = currentPeriodo();
  const { data: existing } = await service
    .from("parametros_tarifa")
    .select("*")
    .eq("periodo", periodo)
    .maybeSingle();

  if (existing) {
    return {
      created: false,
      tariff: mapRow(existing as Record<string, unknown>),
      reason: `Ya existe periodo ${periodo} (${(existing as { estado: string }).estado})`,
    };
  }

  const active = await getActiveTariff(service);
  const energyOverride = options?.energyOverride;
  const fromEnv = Number(process.env.TARIFF_ENERGY_PRICE_EUR_KWH);
  const precio =
    energyOverride ??
    (Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : null) ??
    active?.precio_energia_medio ??
    0.13;

  const draft = await createDraftTariff(service, {
    periodo,
    precio_energia_medio: precio,
    peaje_te_medio: active?.peaje_te_medio ?? 0.034,
    cargo_sistema_medio: active?.cargo_sistema_medio ?? 0.029,
    precio_potencia_kw_mes: active?.precio_potencia_kw_mes ?? 0.08,
    alquiler_contador_mes: active?.alquiler_contador_mes ?? 0.81,
    iee_pct: active?.iee_pct ?? 0.05112696,
    iva_pct: active?.iva_pct ?? 21,
    precio_vertido_factor: active?.precio_vertido_factor ?? 0.5,
    fuente: energyOverride || (Number.isFinite(fromEnv) && fromEnv > 0)
      ? "propuesta automática (precio energía override)"
      : "propuesta automática (copia del periodo activo)",
    notas: "Revisar y activar desde Admin → Tarifas. No se aplica hasta publicar.",
    propuesta_automatica: true,
  });

  return { created: true, tariff: draft };
}
