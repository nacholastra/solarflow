import {
  IEE_RATE_DEFAULT,
  PRECIO_VERTIDO_FACTOR_DEFAULT,
  type Localidad,
} from "@/lib/solar/types";

/** Normaliza una fila de `localidades` al tipo `Localidad` del motor solar. */
export function mapLocalidadRow(row: Record<string, unknown>): Localidad {
  return {
    id: String(row.id),
    nombre: String(row.nombre),
    slug: String(row.slug),
    provincia: String(row.provincia),
    ccaa: String(row.ccaa),
    lat: Number(row.lat),
    lon: Number(row.lon),
    produccion_kwh_kwp_anual: Number(row.produccion_kwh_kwp_anual),
    precio_energia_kwh: Number(row.precio_energia_kwh),
    peaje_te_kwh: Number(row.peaje_te_kwh),
    cargo_sistema_kwh: Number(row.cargo_sistema_kwh),
    precio_potencia_kw_mes: Number(row.precio_potencia_kw_mes),
    alquiler_contador_mes: Number(row.alquiler_contador_mes),
    potencia_tipica_residencial_kw: Number(row.potencia_tipica_residencial_kw),
    potencia_tipica_comercial_kw: Number(row.potencia_tipica_comercial_kw),
    usa_igic: Boolean(row.usa_igic),
    iva_pct: Number(row.iva_pct),
    igic_energia_pct: Number(row.igic_energia_pct),
    iee_pct: Number(row.iee_pct ?? IEE_RATE_DEFAULT),
    precio_vertido_factor: Number(row.precio_vertido_factor ?? PRECIO_VERTIDO_FACTOR_DEFAULT),
  };
}
