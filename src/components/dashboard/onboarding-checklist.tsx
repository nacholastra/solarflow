import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BRAND } from "@/lib/config/brand";
import { cn } from "@/lib/utils";
import { isTrialActive } from "@/lib/empresa/subscription-access";

const DEFAULT_BRAND_COLOR = "#F59E0B";

type OnboardingChecklistProps = {
  privacyUrl: string | null;
  logoUrl: string | null;
  colorMarca: string | null;
  hasPaypal: boolean;
  trialEndsAt: string | null;
  estadoSuscripcion: string;
  totalLeads: number;
};

export function OnboardingChecklist({
  privacyUrl,
  logoUrl,
  colorMarca,
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

  const hasPrivacy = Boolean(privacyUrl?.trim());
  const simulatorTouched =
    hasPrivacy ||
    Boolean(logoUrl?.trim()) ||
    Boolean(colorMarca && colorMarca.toUpperCase() !== DEFAULT_BRAND_COLOR);

  const steps = [
    {
      id: "account",
      label: "Cuenta creada",
      description: "Prueba gratuita activa — ya estás dentro",
      done: true as boolean,
      href: "/dashboard",
    },
    {
      id: "simulator",
      label: "Personaliza tu simulador",
      description: "Logo, color o política de privacidad",
      done: simulatorTouched,
      href: "/dashboard/simulator",
    },
    {
      id: "embed",
      label: "Listo para publicar en tu web",
      description: "Añade la URL de privacidad y copia el iframe",
      done: hasPrivacy,
      href: "/dashboard/simulator",
    },
    {
      id: "lead",
      label: "Genera tu primer lead",
      description: "Usa la vista previa: el lead de prueba no consume cuota",
      done: totalLeads > 0,
      href: "/dashboard/simulator",
    },
    {
      id: "subscription",
      label: onTrial
        ? totalLeads > 0
          ? "Activa el plan para no perder leads reales"
          : "Activa tu suscripción antes de que termine la prueba"
        : "Suscripción activa",
      description: onTrial
        ? totalLeads > 0
          ? "Ya tienes actividad en el CRM — sin plan, el widget deja de captar"
          : "Pago mensual con PayPal, sin permanencia"
        : "Tu plan está activo",
      done: hasPaypal || !onTrial,
      href: "/dashboard/subscription",
    },
  ];

  const actionable = steps.filter((s) => s.id !== "account");
  const completedActionable = actionable.filter((s) => s.done).length;
  if (completedActionable === actionable.length) return null;

  const completed = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completed / steps.length) * 100);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Primeros pasos</CardTitle>
        <CardDescription>
          {completed} de {steps.length} · {progressPct}% — configura {BRAND.name} en pocos minutos.
        </CardDescription>
        <Progress value={progressPct} className="mt-3 h-2" aria-label={`Progreso ${progressPct}%`} />
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
