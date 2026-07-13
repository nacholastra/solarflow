import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/config/brand";
import { cn } from "@/lib/utils";
import { isTrialActive } from "@/lib/empresa/subscription-access";

type OnboardingChecklistProps = {
  privacyUrl: string | null;
  hasPaypal: boolean;
  trialEndsAt: string | null;
  estadoSuscripcion: string;
  totalLeads: number;
};

export function OnboardingChecklist({
  privacyUrl,
  hasPaypal,
  trialEndsAt,
  estadoSuscripcion,
  totalLeads,
}: OnboardingChecklistProps) {
  const onTrial = isTrialActive({
    estado_suscripcion: estadoSuscripcion,
    trial_ends_at: trialEndsAt,
    paypal_subscription_id: hasPaypal ? "active" : null,
  });

  const steps = [
    {
      id: "simulator",
      label: "Configura tu simulador",
      description: "Marca, logo y política de privacidad",
      done: Boolean(privacyUrl?.trim()),
      href: "/dashboard/simulator",
    },
    {
      id: "embed",
      label: "Instala el widget en tu web",
      description: "Copia el iframe desde el simulador",
      done: Boolean(privacyUrl?.trim()),
      href: "/dashboard/simulator",
    },
    {
      id: "lead",
      label: "Recibe tu primer lead",
      description: "Prueba el modo vista previa o publica el widget",
      done: totalLeads > 0,
      href: "/dashboard/crm",
    },
    {
      id: "subscription",
      label: onTrial ? "Activa tu suscripción antes de que termine la prueba" : "Suscripción activa",
      description: onTrial ? "Pago mensual con PayPal, sin permanencia" : "Tu plan está activo",
      done: hasPaypal || !onTrial,
      href: "/dashboard/subscription",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Primeros pasos</CardTitle>
        <CardDescription>
          {completed} de {steps.length} completados — configura {BRAND.name} en pocos minutos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ul className="space-y-2">
          {steps.map((step) => (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2.5",
                step.done && "opacity-70",
              )}
            >
              {step.done ? (
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {!step.done && (
                <Button size="sm" variant="outline" className="shrink-0" asChild>
                  <Link href={step.href}>Ir</Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
