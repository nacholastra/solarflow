import { IEE_RATE, type DesgloseFactura, type Localidad, type TipoInmueble } from "./types";

function getPotenciaKw(localidad: Localidad, tipo: TipoInmueble): number {
  return tipo === "residencial"
    ? localidad.potencia_tipica_residencial_kw
    : localidad.potencia_tipica_comercial_kw;
}

function calcImpuestoFinal(subtotal: number, iee: number, localidad: Localidad): number {
  const base = subtotal + iee;
  if (localidad.usa_igic) {
    return base * (localidad.igic_energia_pct / 100);
  }
  return base * (localidad.iva_pct / 100);
}

/** Calcula factura mensual completa para un consumo en kWh */
export function desgloseFactura(
  kwhMensual: number,
  localidad: Localidad,
  tipoInmueble: TipoInmueble,
): DesgloseFactura {
  const potenciaKw = getPotenciaKw(localidad, tipoInmueble);
  const terminoEnergia = kwhMensual * localidad.precio_energia_kwh;
  const terminoPotencia = potenciaKw * localidad.precio_potencia_kw_mes;
  const peajesCargos = kwhMensual * (localidad.peaje_te_kwh + localidad.cargo_sistema_kwh);
  const alquiler = localidad.alquiler_contador_mes;
  const subtotal = terminoEnergia + terminoPotencia + peajesCargos + alquiler;
  const iee = subtotal * IEE_RATE;
  const impuestoFinal = calcImpuestoFinal(subtotal, iee, localidad);
  const total = subtotal + iee + impuestoFinal;

  return {
    termino_energia: round2(terminoEnergia),
    termino_potencia: round2(terminoPotencia),
    peajes_cargos: round2(peajesCargos),
    alquiler_contador: round2(alquiler),
    subtotal: round2(subtotal),
    iee: round2(iee),
    impuesto_final: round2(impuestoFinal),
    total: round2(total),
    precio_efectivo_kwh: kwhMensual > 0 ? round4(total / kwhMensual) : 0,
    potencia_kw: potenciaKw,
  };
}

/** kWh/mes → €/mes con impuestos incluidos */
export function kwhToGasto(
  kwhMensual: number,
  localidad: Localidad,
  tipoInmueble: TipoInmueble,
): number {
  if (kwhMensual <= 0) return 0;
  return desgloseFactura(kwhMensual, localidad, tipoInmueble).total;
}

/**
 * €/mes → kWh/mes (búsqueda binaria sobre kwhToGasto para precisión con impuestos).
 */
export function gastoToKwh(
  gastoMensual: number,
  localidad: Localidad,
  tipoInmueble: TipoInmueble,
): number {
  if (gastoMensual <= 0) return 0;

  const fixedGasto = kwhToGasto(0, localidad, tipoInmueble);
  if (gastoMensual <= fixedGasto) return 0;

  let low = 0;
  let high = 10000;

  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const g = kwhToGasto(mid, localidad, tipoInmueble);
    if (g < gastoMensual) low = mid;
    else high = mid;
  }

  return round2((low + high) / 2);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
