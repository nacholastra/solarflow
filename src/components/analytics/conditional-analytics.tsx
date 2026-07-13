"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleTagManager } from "@/components/analytics/google-tag-manager";
import { getStoredCookieConsent, type CookieConsent } from "@/components/cookie-consent";

export function ConditionalAnalytics() {
  const [consent, setConsent] = useState<CookieConsent>(null);

  useEffect(() => {
    setConsent(getStoredCookieConsent());

    function onChange(e: Event) {
      const detail = (e as CustomEvent<CookieConsent>).detail;
      setConsent(detail);
    }

    window.addEventListener("cookie-consent-change", onChange);
    return () => window.removeEventListener("cookie-consent-change", onChange);
  }, []);

  if (consent !== "accepted") return null;

  return (
    <>
      <GoogleTagManager />
      <GoogleAnalytics />
    </>
  );
}
