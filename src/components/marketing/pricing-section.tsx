import { SectionHeader } from "@/components/marketing/section-header";
import { RevealOnScroll } from "@/components/marketing/reveal-on-scroll";
import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, getPlanPrice, getEurToUsdRate } from "@/lib/config/plans";
import { TRIAL_DAYS } from "@/lib/config/trial";
import type { LaunchOfferStatus } from "@/lib/config/launch-offer-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PlanFeatureBlock = {
  items: string[];
  intro?: string;
};

const planFeatures: Record<"basic" | "pro", PlanFeatureBlock> = {
  basic: {
    items: [
      `${PLANS.basic.leadsLimit} leads reales al mes`,
      `${PLANS.basic.teamLimit} usuarios (1 Admin + 1 Comercial)`,
      "Simulador embebible + vista previa + iframe",
      "Personalización de color y logo",
      "Motor ROI configurable (€/kWp, autoconsumo, kWp máx.)",
      "CRM Kanban (6 estados) + listado de contactos",
      "Panel con KPIs y uso del plan",
      'Marca "Powered by SolarFlow" en el widget',
    ],
  },
  pro: {
    intro: "Incluye todo lo del plan Basic, y además:",
    items: [
      `${PLANS.pro.leadsLimit} leads reales al mes (×10 vs Basic)`,
      `Hasta ${PLANS.pro.teamLimit} usuarios en equipo`,
      "Marca blanca: sin watermark SolarFlow",
      "Google Tag Manager en el widget",
      "Exportación CSV de contactos",
      "Webhooks HTTPS (Zapier, Make, etc.)",
      "Prueba de webhook desde el panel",
    ],
  },
};

const planMeta = {
  basic: {
    description: "Para validar captación en tu web con pocos leads al mes y un equipo pequeño.",
    featured: false,
  },
  pro: {
    description: "Para escalar volumen, quitar nuestra marca y automatizar con webhooks.",
    featured: true,
  },
} as const;

export function PricingSection({ offer }: { offer: LaunchOfferStatus }) {
  const discount = offer.active ? offer.discountPercent : 0;

  return (
    <section id="precios" className="scroll-mt-16 border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <RevealOnScroll>
          <SectionHeader
            align="center"
            eyebrow="Precios"
            title="Planes claros, sin letra pequeña"
            description={
              offer.active
                ? `Para instaladoras en España: ${TRIAL_DAYS} días gratis y ${offer.discountPercent}% de descuento permanente para los ${offer.earlyBirdLimit} primeros (quedan ${offer.slotsRemaining}). Sin permanencia. Precios en euros.`
                : `Para instaladoras solares en España. ${TRIAL_DAYS} días de prueba gratuita. Facturación mensual con PayPal. Sin permanencia. IVA no incluido.`
            }
          />
        </RevealOnScroll>

        <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2 md:items-stretch">
          {(["basic", "pro"] as const).map((id, index) => {
            const plan = PLANS[id];
            const meta = planMeta[id];
            const features = planFeatures[id];
            const fullPrice = getPlanPrice(id, "EUR");
            const salePrice = getPlanPrice(id, "EUR", { discountPercent: discount });
            const saleUsd = getPlanPrice(id, "USD", { discountPercent: discount });

            return (
              <RevealOnScroll key={id} delay={index * 100} className="h-full">
                <Card
                  className={cn(
                    "relative flex h-full flex-col",
                    meta.featured && "border-solar/50 shadow-elevated",
                  )}
                >
                  <CardHeader className={cn("pb-4", meta.featured && "pt-8")}>
                    <div className="mb-3 flex min-h-7 flex-wrap gap-2">
                      {meta.featured ? (
                        <Badge variant="solar" className="w-fit">
                          Más completo
                        </Badge>
                      ) : (
                        <span className="invisible text-xs" aria-hidden>
                          placeholder
                        </span>
                      )}
                      {offer.active && (
                        <Badge variant="outline" className="w-fit border-solar/40 text-solar">
                          −{offer.discountPercent}% lanzamiento
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{meta.description}</CardDescription>
                    <div className="mt-4 flex flex-wrap items-baseline gap-2">
                      {discount > 0 && (
                        <span className="text-lg text-muted-foreground line-through">
                          {fullPrice} €
                        </span>
                      )}
                      <span className="text-4xl font-semibold tracking-tight text-foreground">
                        {salePrice}
                      </span>
                      <span className="text-sm text-muted-foreground">€ / mes</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ≈ {saleUsd} $ / mes · IVA no incluido
                      {discount > 0 ? ` · tipo cambio ${getEurToUsdRate().toFixed(2)}` : ""}
                    </p>
                    <p className="mt-2 text-xs font-medium text-positive">
                      Incluye {TRIAL_DAYS} días de prueba gratis
                    </p>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                    {features.intro && (
                      <p className="text-sm font-semibold text-foreground">{features.intro}</p>
                    )}
                    <ul className="flex flex-col gap-2.5">
                      {features.items.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-foreground"
                        >
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-positive/10 text-positive">
                            <Check className="size-2.5" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="mt-auto flex-col gap-2">
                    <Button
                      variant={meta.featured ? "solar" : "outline"}
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <Link href="/register">
                        {offer.active
                          ? `Probar ${TRIAL_DAYS} días gratis`
                          : `Empezar con ${plan.name}`}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      asChild
                    >
                      <Link href="#contacto">¿Dudas? Contáctanos</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
