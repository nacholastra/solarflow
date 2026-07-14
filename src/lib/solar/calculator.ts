import { desgloseFactura } from "./billing-es";
import { PRECIO_VERTIDO_FACTOR_DEFAULT, type SimulacionInput, type SimulacionResultado } from "./types";

export function calcularSimulacion(input: SimulacionInput): SimulacionResultado {
  const { localidad, tipoInmueble, consumoKwhMensual, empresaConfig } = input;

  const desglose = desgloseFactura(consumoKwhMensual, localidad, tipoInmueble);
  const precioKwh =
    empresaConfig.tarifa_kwh_override ?? desglose.precio_efectivo_kwh;

  const consumoAnual = consumoKwhMensual * 12;
  // Dimensionar para que la producción anual ≈ consumo anual en esa localidad
  const kwpBruto = consumoAnual / localidad.produccion_kwh_kwp_anual;
  const kwpEstimado = Math.min(
    Math.round(kwpBruto * 10) / 10,
    empresaConfig.kwp_max,
  );

  const produccionAnual = kwpEstimado * localidad.produccion_kwh_kwp_anual;
  // Autoconsumo físico: no puede superar el consumo anual del cliente
  const autoconsumoKwh = Math.min(
    produccionAnual * empresaConfig.ratio_autoconsumo,
    consumoAnual,
  );
  const excedenteKwh = Math.max(0, produccionAnual - autoconsumoKwh);
  const vertidoFactor =
    Number.isFinite(localidad.precio_vertido_factor) && localidad.precio_vertido_factor >= 0
      ? localidad.precio_vertido_factor
      : PRECIO_VERTIDO_FACTOR_DEFAULT;
  const precioVertido = precioKwh * vertidoFactor;
  const ahorroAnual =
    autoconsumoKwh * precioKwh + excedenteKwh * precioVertido;
  const inversion = kwpEstimado * empresaConfig.precio_eur_kwp;
  const payback = ahorroAnual > 0 ? inversion / ahorroAnual : 0;

  return {
    kwp_estimado: kwpEstimado,
    produccion_anual_kwh: Math.round(produccionAnual),
    ahorro_anual_eur: Math.round(ahorroAnual),
    payback_anos: Math.round(payback * 10) / 10,
    precio_efectivo_kwh: precioKwh,
    consumo_kwh_mensual: consumoKwhMensual,
    gasto_mensual_eur: desglose.total,
    desglose_factura: desglose,
  };
}
