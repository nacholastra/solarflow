import { BRAND } from "@/lib/config/brand";
import { LANDING_FAQS } from "@/lib/config/faq";
import { LANDING_DESCRIPTION, OG_IMAGE_URL } from "@/lib/config/seo";
import { getSiteUrl } from "@/lib/config/site";
import { PLANS } from "@/lib/config/plans";

export function LandingJsonLd() {
  const siteUrl = getSiteUrl();

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    email: BRAND.supportEmail,
    description: BRAND.tagline,
    areaServed: {
      "@type": "Country",
      name: "España",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: siteUrl,
    description: LANDING_DESCRIPTION,
    inLanguage: "es-ES",
    publisher: { "@type": "Organization", name: BRAND.name },
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description: LANDING_DESCRIPTION,
    offers: [
      {
        "@type": "Offer",
        name: `Plan ${PLANS.basic.name}`,
        price: PLANS.basic.priceEur,
        priceCurrency: "EUR",
        description: `${PLANS.basic.leadsLimit} leads/mes, simulador, CRM y hasta ${PLANS.basic.teamLimit} usuarios`,
      },
      {
        "@type": "Offer",
        name: `Plan ${PLANS.pro.name}`,
        price: PLANS.pro.priceEur,
        priceCurrency: "EUR",
        description: `${PLANS.pro.leadsLimit} leads/mes, marca blanca, GTM, CSV y webhooks`,
      },
    ],
    featureList: [
      "Simulador solar embebible",
      "Cálculo ROI por localidad PVGIS",
      "CRM Kanban",
      "Integración Zapier y Make",
      "Multiusuario con roles",
    ],
    screenshot: OG_IMAGE_URL,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: LANDING_FAQS.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  const schemas = [organization, website, software, faqPage];

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
