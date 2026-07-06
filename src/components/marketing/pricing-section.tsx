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
    `${PLANS.basic.leadsLimit} leads al mes`,
    `${PLANS.basic.teamLimit} usuarios (1 Admin + 1 Comercial)`,
    "Simulador embebible con vista previa e iframe",
    "Personalización: color y logo",
    'Marca "Powered by SolarFlow" en el widget',
    "Motor ROI (€/kWp, autoconsumo, kWp máx.)",
    "CRM Kanban con 6 estados y notas",
    "Listado de contactos con buscador",
    "Panel con KPIs y uso del plan",
    "Soporte por email",
  ],
  pro: [
    `${PLANS.pro.leadsLimit} leads al mes`,
    `${PLANS.pro.teamLimit} usuarios en equipo`,
    "Todo lo del plan Basic",
    "Marca blanca (sin watermark SolarFlow)",
    "Google Tag Manager en el widget",
    "Exportación CSV de contactos",
    "Webhooks automáticos (Zapier, Make, CRM)",
    "Prueba de webhooks desde el panel",
    "Upgrade automático desde Basic",
    "Soporte comercial prioritario",
  ],
};

const planMeta = {
  basic: {
    description: "Valida el retorno de inversión captando y gestionando tus primeros leads.",
    featured: false,
  },
  pro: {
    description: "Escala tu captación con marca blanca, analítica y automatizaciones B2B.",
    featured: true,
  },
} as const;

export function PricingSection() {
  return (
    <section id="precios" className="scroll-mt-16 border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-solar">Precios</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Un plan para cada volumen de leads
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Sin permanencia. Cancela cuando quieras. Precios base en euros; el dólar se calcula al tipo{" "}
            {getEurToUsdRate().toFixed(2)}.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          {(["basic", "pro"] as const).map((id) => {
            const plan = PLANS[id];
            const meta = planMeta[id];
            return (
              <Card
                key={id}
                className={cn("relative flex flex-col", meta.featured && "border-primary shadow-md")}
              >
                {meta.featured && (
                  <Badge variant="solar" className="absolute -top-3 left-6">
                    Recomendado
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
                    ≈ {getPlanPrice(id, "USD")} $ / mes
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
                <CardFooter>
                  <Button
                    variant={meta.featured ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href="/register">Empezar con {plan.name}</Link>
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
