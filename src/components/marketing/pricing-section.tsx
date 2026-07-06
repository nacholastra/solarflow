import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/config/plans";
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
    "Simulador embebible personalizable",
    "CRM Kanban + contactos",
    `${PLANS.basic.teamLimit} usuarios en equipo`,
    "Exportación CSV",
    "Soporte por email",
  ],
  pro: [
    `${PLANS.pro.leadsLimit} leads al mes`,
    "Todo lo del plan Basic",
    `${PLANS.pro.teamLimit} usuarios en equipo`,
    "Integraciones webhook (Zapier/Make)",
    "Prioridad en soporte",
    "Ideal para equipos comerciales",
  ],
};

const planMeta = {
  basic: {
    description: "Para instaladoras que empiezan a captar leads online.",
    featured: false,
  },
  pro: {
    description: "Para equipos comerciales con mayor volumen de captación.",
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
            Sin permanencia. Cancela cuando quieras. Precios por empresa, no por usuario.
            Facturación en EUR o USD.
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
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">USD / mes</span>
                  </div>
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
