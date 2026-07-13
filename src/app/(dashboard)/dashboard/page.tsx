import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  KanbanSquare,
  MonitorSmartphone,
  Percent,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { formatNumber } from "@/lib/utils";
import { requireDashboardContext } from "@/lib/dashboard/session";

export default async function DashboardPage() {
  const { empresaId } = await requireDashboardContext();
  const supabase = await createClient();

  const [{ data: empresa }, totalRes, nuevosRes, cerradosRes] = await Promise.all([
    supabase
      .from("empresas")
      .select(
        "nombre_empresa, plan, leads_limite_mes, leads_usados_mes, estado_suscripcion, privacy_url, trial_ends_at, paypal_subscription_id",
      )
      .eq("id", empresaId)
      .single(),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", empresaId),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("estado", "Nuevo"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("estado", "Cerrado"),
  ]);

  if (!empresa) {
    return <p className="text-muted-foreground">No se encontró tu empresa. Contacta soporte.</p>;
  }

  const total = totalRes.count ?? 0;
  const nuevos = nuevosRes.count ?? 0;
  const cerrados = cerradosRes.count ?? 0;
  const conversion = total > 0 ? (cerrados / total) * 100 : 0;
  const usagePct =
    empresa.leads_limite_mes > 0 ? (empresa.leads_usados_mes / empresa.leads_limite_mes) * 100 : 0;
  const remaining = Math.max(empresa.leads_limite_mes - empresa.leads_usados_mes, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Panel"
        description={`Resumen de la actividad de ${empresa.nombre_empresa}.`}
      />

      <OnboardingChecklist
        privacyUrl={empresa.privacy_url}
        hasPaypal={Boolean(empresa.paypal_subscription_id)}
        trialEndsAt={empresa.trial_ends_at}
        estadoSuscripcion={empresa.estado_suscripcion}
        totalLeads={total}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total de leads" value={String(total)} icon={Users} hint="Acumulado" />
        <StatCard
          label="Leads nuevos"
          value={String(nuevos)}
          icon={Sparkles}
          hint="Sin contactar"
          hintTone="positive"
        />
        <StatCard
          label="Conversión"
          value={`${formatNumber(conversion, 1)}%`}
          icon={Percent}
          hint="Leads cerrados"
          hintTone="positive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Uso de tu plan</CardTitle>
            <CardDescription>Leads capturados en el periodo de facturación actual.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-0">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold text-foreground">
                {empresa.leads_usados_mes}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  / {empresa.leads_limite_mes} leads
                </span>
              </span>
              <span className="text-sm font-medium capitalize text-muted-foreground">
                Plan {empresa.plan ?? "sin activar"}
              </span>
            </div>
            <Progress value={usagePct} />
            {empresa.estado_suscripcion !== "active" ? (
              <div className="surface-warning flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <p className="text-sm">
                  Suscripción inactiva. Activa un plan para recibir leads en el widget.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/dashboard/subscription">Activar plan</Link>
                </Button>
              </div>
            ) : empresa.trial_ends_at && !empresa.paypal_subscription_id ? (
              <p className="text-sm text-muted-foreground">
                Periodo de prueba activo. Te quedan {remaining} leads este mes.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Te quedan {remaining} leads este mes.
                {empresa.plan === "basic" && " Actualiza a Pro para ampliar tu límite a 250 leads."}
              </p>
            )}
            <Button variant="outline" className="w-fit" asChild>
              <Link href="/dashboard/subscription">
                Ver planes
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
            <CardDescription>Salta a las tareas frecuentes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
            <Button variant="outline" size="lg" className="justify-start" asChild>
              <Link href="/dashboard/crm">
                <KanbanSquare className="size-4" />
                Ver CRM
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="justify-start" asChild>
              <Link href="/dashboard/simulator">
                <MonitorSmartphone className="size-4" />
                Configurar simulador
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
