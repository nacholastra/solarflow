import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleTagManager } from "@/components/analytics/google-tag-manager";

/**
 * Analytics de marketing en la landing.
 * GA4 va directo (G-500YJJ712S). No añadas otra etiqueta GA4 en GTM o duplicarás visitas.
 */
export function LandingAnalytics() {
  return (
    <>
      <GoogleTagManager />
      <GoogleAnalytics />
    </>
  );
}
