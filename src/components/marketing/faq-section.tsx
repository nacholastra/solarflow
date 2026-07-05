"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/config/brand";

const faqs = [
  {
    q: "¿Para qué tipo de empresas está pensado SolarFlow?",
    a: "Para instaladoras de energía solar, integradores y empresas del sector fotovoltaico en España que quieren captar leads desde su web con un simulador profesional y gestionarlos en un CRM.",
  },
  {
    q: "¿Cómo se instala el simulador en mi web?",
    a: "Desde el panel copias un código iframe o usas la URL pública del widget. Funciona con WordPress, Webflow, Wix o cualquier web que permita insertar HTML. No necesitas programador.",
  },
  {
    q: "¿Los cálculos son fiables?",
    a: "Las estimaciones usan datos de producción solar por localidad (PVGIS), tarifas eléctricas, peajes, cargos, IEE e IVA/IGIC. Son orientativas y no sustituyen un estudio técnico in situ, pero dan una base realista al visitante.",
  },
  {
    q: "¿Qué pasa cuando llega un lead?",
    a: "Se guarda en tu CRM de SolarFlow (Kanban + contactos), incrementa tu contador mensual y, si configuras un webhook, se envía automáticamente a Zapier, Make u otra herramienta.",
  },
  {
    q: "¿Puedo conectarlo a mi CRM actual?",
    a: "Sí. Con el plan Pro puedes configurar webhooks para enviar cada lead a HubSpot, Pipedrive, Google Sheets, email o cualquier sistema compatible con Zapier o Make.",
  },
  {
    q: "¿Hay permanencia en los planes?",
    a: "No. Los planes se facturan mensualmente y puedes cancelar cuando quieras desde tu panel de suscripción.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Preguntas frecuentes</h2>
        </div>

        <div className="mt-12 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {faqs.map(({ q, a }, i) => (
            <div key={q}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium transition-colors hover:bg-muted/30"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {q}
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          ¿Más dudas? Escríbenos a{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="font-medium text-foreground underline-offset-4 hover:underline">
            {BRAND.supportEmail}
          </a>
        </p>
      </div>
    </section>
  );
}
