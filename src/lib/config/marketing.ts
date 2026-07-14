import { BRAND } from "@/lib/config/brand";
import { TRIAL_DAYS } from "@/lib/config/trial";
import { LAUNCH_OFFER } from "@/lib/config/launch-offer";

/** Copy de marketing alineado con lo que el producto implementa hoy. */
export const MARKETING = {
  hero: {
    eyebrow: "Hecho para instaladoras solares en España",
    title: "Capta leads solares en España desde tu web y ciérralos con un CRM claro",
    subtitle:
      "Software B2B para el mercado español: simulador embebible con estimaciones por localidad (PVGIS, tarifas, peajes, IVA/IGIC), captura con RGPD y CRM Kanban. Pensado para instaladoras e integradores fotovoltaicos que operan en España.",
    highlights: [
      "Mercado: España (localidades y fiscalidad local)",
      `${TRIAL_DAYS} días de prueba gratuita`,
      `−${LAUNCH_OFFER.discountPercent}% para los ${LAUNCH_OFFER.earlyBirdLimit} primeros`,
      "Simulador embebible + CRM Kanban",
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
