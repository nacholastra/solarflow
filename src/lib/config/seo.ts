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
  "Simulador solar embebible y CRM Kanban para instaladoras en España. Estimaciones por localidad (PVGIS), captura RGPD y planes desde 60 €/mes sin permanencia.";

/** Imagen Open Graph (asset propio del sitio) */
export function getOgImageUrl(): string {
  return `${getSiteUrl()}/brand/logo.png`;
}

export function buildLandingMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const ogImage = getOgImageUrl();

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
          url: ogImage,
          width: 512,
          height: 512,
          alt: "SolarFlow — Simulador solar y CRM para instaladoras",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: LANDING_TITLE,
      description: LANDING_DESCRIPTION,
      images: [ogImage],
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
