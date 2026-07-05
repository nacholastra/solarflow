import type { Metadata } from "next";
import { BRAND } from "@/lib/config/brand";
import { getSiteUrl } from "@/lib/config/site";

export const SEO_KEYWORDS = [
  "simulador solar",
  "simulador fotovoltaico",
  "CRM instaladoras solares",
  "captación leads solar",
  "calculadora rentabilidad solar",
  "widget solar embebible",
  "software instaladoras fotovoltaicas",
  "leads paneles solares España",
  "PVGIS simulador",
  "SaaS energía solar B2B",
] as const;

export const LANDING_TITLE =
  "SolarFlow — Simulador solar y CRM para instaladoras en España";

export const LANDING_DESCRIPTION =
  "Capta leads cualificados con un simulador de rentabilidad solar embebible. Cálculos por ciudad con PVGIS, CRM Kanban e integración Zapier. Planes desde 60 USD/mes.";

/** Imagen Open Graph (1200×630 recomendado) */
export const OG_IMAGE_URL =
  "https://images.unsplash.com/photo-1508514177221-1881a7f647ea?w=1200&h=630&fit=crop&q=80";

export function buildLandingMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    authors: [{ name: BRAND.name, url: siteUrl }],
    creator: BRAND.name,
    publisher: BRAND.name,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/",
      languages: {
        "es-ES": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: siteUrl,
      siteName: BRAND.name,
      title: LANDING_TITLE,
      description: LANDING_DESCRIPTION,
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Instalación de paneles solares en tejado residencial — SolarFlow",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: LANDING_TITLE,
      description: LANDING_DESCRIPTION,
      images: [OG_IMAGE_URL],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: "technology",
  };
}

export const PRIVATE_PAGE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};
