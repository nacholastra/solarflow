import { desgloseFactura, kwhToGasto } from "./billing-es";
import type { EmpresaSimuladorConfig, SimulacionInput, SimulacionResultado } from "./types";

const FACTOR_COBERTURA = 1200;

export function calcularSimulacion(input: SimulacionInput): SimulacionResultado {
  const { localidad, tipoInmueble, consumoKwhMensual, empresaConfig } = input;

  const desglose = desgloseFactura(consumoKwhMensual, localidad, tipoInmueble);
  const precioKwh =
    empresaConfig.tarifa_kwh_override ?? desglose.precio_efectivo_kwh;

  const consumoAnual = consumoKwhMensual * 12;
  const kwpBruto = consumoAnual / FACTOR_COBERTURA;
  const kwpEstimado = Math.min(
    Math.round(kwpBruto * 10) / 10,
    empresaConfig.kwp_max,
  );

  const produccionAnual = kwpEstimado * localidad.produccion_kwh_kwp_anual;
  const ahorroAnual =
    produccionAnual * precioKwh * empresaConfig.ratio_autoconsumo;
  const inversion = kwpEstimado * empresaConfig.precio_eur_kwp;
  const payback = ahorroAnual > 0 ? inversion / ahorroAnual : 0;

  return {
    kwp_estimado: kwpEstimado,
    produccion_anual_kwh: Math.round(produccionAnual),
    ahorro_anual_eur: Math.round(ahorroAnual),
    payback_anos: Math.round(payback * 10) / 10,
    precio_efectivo_kwh: precioKwh,
    consumo_kwh_mensual: consumoKwhMensual,
    gasto_mensual_eur: kwhToGasto(consumoKwhMensual, localidad, tipoInmueble),
    desglose_factura: desglose,
  };
}

export const DEFAULT_EMPRESA_CONFIG: EmpresaSimuladorConfig = {
  precio_eur_kwp: 1200,
  ratio_autoconsumo: 0.7,
  kwp_max: 10,
};
