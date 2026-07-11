import { SectionHeader } from "@/components/marketing/section-header";
import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, getPlanPrice, getEurToUsdRate } from "@/lib/config/plans";
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

const planFeatures = {
  basic: [
    `${PLANS.basic.leadsLimit} leads reales al mes (cuota del plan)`,
    `${PLANS.basic.teamLimit} usuarios: 1 Admin + 1 Comercial`,
    "Simulador embebible + vista previa + iframe",
    "Personalización de color y logo",
    'Marca "Powered by SolarFlow" visible en el widget',
    "Motor ROI configurable (€/kWp, autoconsumo, kWp máx.)",
    "CRM Kanban (6 estados) con notas por lead",
    "Listado de contactos con buscador",
    "Panel con KPIs y barra de uso del plan",
    "Atención mediante formulario de contacto",
  ],
  pro: [
    `${PLANS.pro.leadsLimit} leads reales al mes`,
    `Hasta ${PLANS.pro.teamLimit} usuarios en equipo`,
    "Todo lo incluido en Basic",
    "Marca blanca: sin watermark SolarFlow",
    "Google Tag Manager en el widget",
    "Exportación CSV de contactos",
    "Webhooks HTTPS (Zapier, Make, etc.)",
    "Prueba de webhook desde el panel",
    "Upgrade desde Basic sin crear cuenta nueva",
  ],
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

export function PricingSection() {
  return (
    <section id="precios" className="scroll-mt-16 border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <SectionHeader
          align="center"
          eyebrow="Precios"
          title="Planes claros, sin letra pequeña"
          description={`Facturación mensual con PayPal. Sin permanencia. Precios en euros; referencia USD al tipo ${getEurToUsdRate().toFixed(2)}. Los leads de prueba del panel no consumen cuota.`}
        />

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          {(["basic", "pro"] as const).map((id) => {
            const plan = PLANS[id];
            const meta = planMeta[id];
            return (
              <Card
                key={id}
                className={cn("relative flex flex-col", meta.featured && "border-solar/50 shadow-elevated")}
              >
                {meta.featured && (
                  <Badge variant="solar" className="absolute -top-3 left-6">
                    Más completo
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{meta.description}</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {plan.priceEur}
                    </span>
                    <span className="text-sm text-muted-foreground">€ / mes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ≈ {getPlanPrice(id, "USD")} $ / mes · IVA no incluido
                  </p>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <ul className="flex flex-col gap-3">
                    {planFeatures[id].map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-positive/10 text-positive">
                          <Check className="size-2.5" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    variant={meta.featured ? "solar" : "outline"}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href="/register">Empezar con {plan.name}</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground" asChild>
                    <Link href="#contacto">¿Dudas? Contáctanos</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
