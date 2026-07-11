import { PLANS } from "@/lib/config/plans";
import { BRAND } from "@/lib/config/brand";

/** Copy de marketing alineado con lo que el producto implementa hoy. */
export const MARKETING = {
  hero: {
    eyebrow: "Software B2B para instaladoras en España",
    title: "Capta leads solares desde tu web y ciérralos con un CRM claro",
    subtitle:
      "Simulador embebible con estimaciones por localidad, captura con consentimiento RGPD y gestión en Kanban. Sin promesas vacías: sabes qué incluye cada plan antes de pagar.",
    highlights: [
      `Desde ${PLANS.basic.priceEur} €/mes · sin permanencia`,
      `${PLANS.basic.leadsLimit}–${PLANS.pro.leadsLimit} leads/mes según plan`,
      "Webhooks con Zapier/Make en plan Pro",
    ],
  },
  trust: [
    { label: "Precio claro", value: `${PLANS.basic.priceEur}–${PLANS.pro.priceEur} €/mes` },
    { label: "Leads incluidos", value: `${PLANS.basic.leadsLimit} / ${PLANS.pro.leadsLimit} al mes` },
    { label: "Equipo", value: `${PLANS.basic.teamLimit}–${PLANS.pro.teamLimit} usuarios` },
    { label: "Facturación", value: "PayPal · cancela cuando quieras" },
  ],
  honesty: {
    title: "Transparencia sobre lo que ofrecemos",
    items: [
      {
        title: "Estimaciones orientativas",
        body: BRAND.disclaimer,
      },
      {
        title: "Datos solares por localidad",
        body: "Usamos producción PVGIS precargada por ciudad y tarifas españolas (peajes, cargos, IEE, IVA/IGIC). No sustituye una visita técnica ni un dimensionamiento final.",
      },
      {
        title: "Integraciones reales",
        body: "Basic incluye CRM y simulador. Pro añade webhooks HTTPS hacia Zapier/Make, export CSV, GTM en el widget y marca blanca. No hay conectores nativos HubSpot/Pipedrive: se conectan vía automatización.",
      },
      {
        title: "Lo que verás en Basic",
        body: 'El widget muestra "Powered by SolarFlow". En Pro puedes quitarlo y personalizar color y logo.',
      },
    ],
  },
  productExample: {
    disclaimer: "Vista de ejemplo ilustrativa. Los resultados reales dependen de la localidad, consumo y parámetros que configures.",
    location: "Vivienda · Valencia · 150 €/mes",
    stats: {
      ahorro: "1.240 €",
      kwp: "3,8 kWp",
      payback: "7,1 años",
    },
  },
} as const;
