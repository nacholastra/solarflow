import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/config/plans";
import { Button } from "@/components/ui/button";
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

export function PricingSection() {
  return (
    <section id="precios" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Precios
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Planes claros, sin sorpresas
          </h2>
          <p className="mt-4 text-muted-foreground">
            Paga solo por los leads que capturas con el simulador. Sin permanencia ni costes ocultos.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
          {(["basic", "pro"] as const).map((id) => {
            const plan = PLANS[id];
            const isPro = id === "pro";
            return (
              <div
                key={id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8",
                  isPro
                    ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/10"
                    : "border-border/60 bg-card",
                )}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-semibold text-primary">
                    Más popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                    <span className={cn("text-sm", isPro ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      USD / mes
                    </span>
                  </div>
                  <p className={cn("mt-2 text-sm", isPro ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    Facturación en EUR o USD disponible
                  </p>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {planFeatures[id].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={cn("mt-0.5 h-4 w-4 shrink-0", isPro ? "text-amber-400" : "text-emerald-600")}
                        strokeWidth={2.5}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("mt-8 h-11 w-full", isPro && "bg-white text-primary hover:bg-white/90")}
                  variant={isPro ? "secondary" : "default"}
                  asChild
                >
                  <Link href="/register">Empezar con {plan.name}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-muted-foreground">
          ¿Necesitas más de 250 leads al mes? Contacta con nosotros para un plan a medida.
        </p>
      </div>
    </section>
  );
}
