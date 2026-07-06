import { GoogleTagManager } from "@/components/analytics/google-tag-manager";

/** Analytics de marketing: GTM centraliza GA4 y futuras etiquetas. Solo en la landing. */
export function LandingAnalytics() {
  return <GoogleTagManager />;
}
