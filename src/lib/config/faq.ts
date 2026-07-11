import { PLANS } from "@/lib/config/plans";
import { BRAND } from "@/lib/config/brand";

export const LANDING_FAQS = [
  {
    question: "¿Para quién está pensado SolarFlow?",
    answer:
      "Para instaladoras, integradores y empresas del sector fotovoltaico en España que quieren captar leads desde su web con un simulador profesional y gestionarlos en un CRM sencillo.",
  },
  {
    question: "¿Cómo se instala el simulador en mi web?",
    answer:
      "Desde el panel copias un código iframe o la URL pública del widget. Funciona en WordPress, Webflow, Wix o cualquier web que permita HTML embebido. No necesitas desarrollador.",
  },
  {
    question: "¿Los cálculos de rentabilidad son fiables?",
    answer:
      "Son estimaciones orientativas basadas en producción solar por localidad (PVGIS precargado), tarifas, peajes, cargos, IEE e IVA/IGIC. Ayudan a cualificar al visitante, pero no sustituyen un estudio técnico in situ.",
  },
  {
    question: "¿Qué pasa cuando llega un lead?",
    answer:
      "Se guarda en tu CRM (Kanban y listado de contactos), cuenta en tu límite mensual del plan y, si tienes plan Pro con webhook configurado, se envía a Zapier, Make u otra URL HTTPS permitida.",
  },
  {
    question: "¿Puedo conectar SolarFlow a mi CRM actual?",
    answer:
      "Sí, con plan Pro mediante webhooks. Puedes enlazarlo con HubSpot, Pipedrive, Google Sheets o email a través de Zapier o Make. No hay integración nativa directa con esos CRM.",
  },
  {
    question: "¿Qué diferencia hay entre Basic y Pro?",
    answer: `Basic (${PLANS.basic.priceEur} €/mes): ${PLANS.basic.leadsLimit} leads/mes, ${PLANS.basic.teamLimit} usuarios, simulador, CRM y watermark SolarFlow. Pro (${PLANS.pro.priceEur} €/mes): ${PLANS.pro.leadsLimit} leads/mes, ${PLANS.pro.teamLimit} usuarios, marca blanca, GTM en widget, export CSV y webhooks.`,
  },
  {
    question: "¿Hay permanencia o contrato anual?",
    answer:
      "No. Los planes se facturan mensualmente con PayPal y puedes cancelar desde tu panel de suscripción cuando quieras.",
  },
  {
    question: "¿Cómo tratáis mis datos si os escribo?",
    answer: `Usamos tu email y mensaje solo para responder tu consulta. Necesitamos tu consentimiento explícito (RGPD). Puedes leer más en nuestra política de privacidad o escribir a ${BRAND.supportEmail}.`,
  },
] as const;
