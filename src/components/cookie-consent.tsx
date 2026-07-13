"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "solarflow-cookie-consent";

export type CookieConsent = "accepted" | "rejected" | null;

export function getStoredCookieConsent(): CookieConsent {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function CookieConsentBanner() {
  const [consent, setConsent] = useState<CookieConsent>(null);

  useEffect(() => {
    setConsent(getStoredCookieConsent());
  }, []);

  if (consent !== null) return null;

  function save(value: Exclude<CookieConsent, null>) {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
    window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
  }

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90 md:p-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Usamos cookies técnicas y, si aceptas, cookies de analítica para mejorar la web. Consulta
          nuestra{" "}
          <Link href="/cookies" className="font-medium text-foreground underline-offset-4 hover:underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => save("rejected")}>
            Solo necesarias
          </Button>
          <Button size="sm" onClick={() => save("accepted")}>
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  );
}
