export type TipoInmueble = "residencial" | "comercial";
export type LeadEstado =
  | "Nuevo"
  | "Contactado"
  | "Visita"
  | "Presupuesto"
  | "Cerrado"
  | "Descartado";
export type CampoOrigenConsumo = "gasto" | "kwh";
export type RolEquipo = "admin" | "comercial";
export type EstadoSuscripcion = "pending" | "active" | "suspended" | "cancelled";

export interface Localidad {
  id: string;
  nombre: string;
  slug: string;
  provincia: string;
  ccaa: string;
  lat: number;
  lon: number;
  produccion_kwh_kwp_anual: number;
  precio_energia_kwh: number;
  peaje_te_kwh: number;
  cargo_sistema_kwh: number;
  precio_potencia_kw_mes: number;
  alquiler_contador_mes: number;
  potencia_tipica_residencial_kw: number;
  potencia_tipica_comercial_kw: number;
  usa_igic: boolean;
  iva_pct: number;
  igic_energia_pct: number;
  /** Impuesto especial electricidad (fracción, ej. 0.05112696). */
  iee_pct: number;
  /** Fracción del precio de compra usada como compensación de excedentes. */
  precio_vertido_factor: number;
}

export interface DesgloseFactura {
  termino_energia: number;
  termino_potencia: number;
  peajes_cargos: number;
  alquiler_contador: number;
  subtotal: number;
  iee: number;
  impuesto_final: number;
  total: number;
  precio_efectivo_kwh: number;
  potencia_kw: number;
}

export interface EmpresaSimuladorConfig {
  precio_eur_kwp: number;
  tarifa_kwh_override?: number;
  ratio_autoconsumo: number;
  kwp_max: number;
}

export interface SimulacionInput {
  localidad: Localidad;
  tipoInmueble: TipoInmueble;
  consumoKwhMensual: number;
  empresaConfig: EmpresaSimuladorConfig;
}

export interface SimulacionResultado {
  kwp_estimado: number;
  produccion_anual_kwh: number;
  ahorro_anual_eur: number;
  payback_anos: number;
  precio_efectivo_kwh: number;
  consumo_kwh_mensual: number;
  gasto_mensual_eur: number;
  desglose_factura: DesgloseFactura;
}

export const LEAD_ESTADOS: LeadEstado[] = [
  "Nuevo",
  "Contactado",
  "Visita",
  "Presupuesto",
  "Cerrado",
  "Descartado",
];

export const CCAA_LIST = [
  "Andalucía",
  "Aragón",
  "Asturias",
  "Baleares",
  "Canarias",
  "Cantabria",
  "Castilla y León",
  "Castilla-La Mancha",
  "Cataluña",
  "Ceuta",
  "Comunidad Valenciana",
  "Extremadura",
  "Galicia",
  "La Rioja",
  "Madrid",
  "Melilla",
  "Murcia",
  "Navarra",
  "País Vasco",
] as const;

export const IEE_RATE_DEFAULT = 0.05112696;
export const PRECIO_VERTIDO_FACTOR_DEFAULT = 0.5;

/** @deprecated Usar localidad.iee_pct; se mantiene como fallback. */
export const IEE_RATE = IEE_RATE_DEFAULT;
