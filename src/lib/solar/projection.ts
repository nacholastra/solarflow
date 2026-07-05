/** Inflación media anual estimada del precio de la electricidad en España */
export const INFLACION_ENERGIA_ANUAL = 0.03;

export interface AhorroProyectado {
  anos: number;
  inflacion_anual: number;
  ahorro_total_eur: number;
  ahorro_por_anio: number[];
}

/**
 * Suma el ahorro año a año asumiendo que el precio de la luz sube con inflación.
 * Año 1 = ahorro base; año N = ahorro base × (1 + inflación)^(N-1)
 */
export function calcularAhorroProyectado(
  ahorroAnualBase: number,
  anos: number,
  inflacionAnual = INFLACION_ENERGIA_ANUAL,
): AhorroProyectado {
  if (anos <= 0 || ahorroAnualBase <= 0) {
    return { anos: 0, inflacion_anual: inflacionAnual, ahorro_total_eur: 0, ahorro_por_anio: [] };
  }

  const ahorroPorAnio: number[] = [];
  let total = 0;

  for (let y = 0; y < anos; y++) {
    const ahorro = ahorroAnualBase * (1 + inflacionAnual) ** y;
    ahorroPorAnio.push(Math.round(ahorro));
    total += ahorro;
  }

  return {
    anos,
    inflacion_anual: inflacionAnual,
    ahorro_total_eur: Math.round(total),
    ahorro_por_anio: ahorroPorAnio,
  };
}
