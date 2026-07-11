import { BRAND } from "@/lib/config/brand";

/** Copy de marketing alineado con lo que el producto implementa hoy. */
export const MARKETING = {
  hero: {
    eyebrow: "Software B2B para instaladoras en España",
    title: "Capta leads solares desde tu web y ciérralos con un CRM claro",
    subtitle:
      "Simulador embebible con estimaciones por localidad, captura con consentimiento RGPD y gestión en Kanban. Sin promesas vacías: sabes qué incluye cada plan antes de pagar.",
    highlights: [
      "Simulador embebible en tu web",
      "CRM Kanban con 6 estados",
      "Consentimiento RGPD integrado",
    ],
  },
  honesty: {
    title: "Transparencia sobre lo que ofrecemos",
    items: [
      {
        title: "Estimaciones orientativas",
        body: BRAND.disclaimer,
      },
      {
        title: "Marca visible en Basic",
        body: 'El widget muestra "Powered by SolarFlow". En Pro puedes quitarlo y personalizar color y logo.',
      },
    ],
  },
  productExample: {
    disclaimer: "Vista de ejemplo ilustrativa. Los resultados reales dependen de la localidad, el consumo y los parámetros que configures.",
    location: "Vivienda · Valencia · 150 €/mes",
    stats: {
      ahorro: "1.240 €",
      kwp: "3,8 kWp",
      payback: "7,1 años",
    },
  },
} as const;
