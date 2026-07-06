import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleTagManager } from "@/components/analytics/google-tag-manager";

/** Analytics de marketing: solo se monta en la landing pública. */
export function LandingAnalytics() {
  return (
    <>
      <GoogleTagManager />
      <GoogleAnalytics />
    </>
  );
}
