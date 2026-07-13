import { PLANS } from "@/lib/config/plans";
import { TRIAL_DAYS } from "@/lib/config/trial";

export const LANDING_FAQS = [
  {
    question: "¿Hay periodo de prueba?",
    answer: `Sí. Al registrarte tienes ${TRIAL_DAYS} días de prueba gratuita con acceso al plan que elijas (Basic o Pro). Puedes configurar el simulador, instalar el widget y recibir leads. Cuando termina la prueba, el widget deja de captar leads hasta que actives el pago con PayPal.`,
  },
  {
    question: "¿Hay descuento de lanzamiento?",
    answer: `Los primeros 20 clientes tienen un 30% de descuento permanente en su plan, además de los ${TRIAL_DAYS} días gratis. Las plazas se reservan al crear la cuenta.`,
  },
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
      "Sí, con plan Pro mediante webhooks. Puedes enlazarlo con HubSpot, Pipedrive, Google Sheets u otras herramientas a través de Zapier o Make. No hay integración nativa directa con esos CRM.",
  },
  {
    question: "¿Qué diferencia hay entre Basic y Pro?",
    answer: `Basic (${PLANS.basic.priceEur} €/mes): ${PLANS.basic.leadsLimit} leads/mes, ${PLANS.basic.teamLimit} usuarios, simulador, CRM y marca SolarFlow visible. Pro (${PLANS.pro.priceEur} €/mes): ${PLANS.pro.leadsLimit} leads/mes, ${PLANS.pro.teamLimit} usuarios, marca blanca, GTM en el widget, exportación CSV y webhooks.`,
  },
  {
    question: "¿Hay permanencia o contrato anual?",
    answer:
      "No. Los planes se facturan mensualmente con PayPal y puedes cancelar desde tu panel de suscripción cuando quieras.",
  },
  {
    question: "¿Cómo tratáis mis datos si relleno el formulario?",
    answer:
      "Usamos tu correo y mensaje únicamente para responder tu consulta. Necesitamos tu consentimiento explícito (RGPD). Puedes leer más en nuestra política de privacidad.",
  },
] as const;
