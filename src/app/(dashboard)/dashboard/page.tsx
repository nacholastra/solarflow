import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowUpRight, TrendingUp, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

async function getEmpresaAndStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: equipo } = await supabase
    .from("equipo")
    .select("empresa_id")
    .eq("usuario_id", user.id)
    .single();

  if (!equipo) return null;

  const { data: empresa } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", equipo.empresa_id)
    .single();

  if (!empresa) return null;

  const { data: leads } = await supabase
    .from("leads")
    .select("estado")
    .eq("empresa_id", empresa.id);

  const total = leads?.length ?? 0;
  const nuevos = leads?.filter((l) => l.estado === "Nuevo").length ?? 0;
  const cerrados = leads?.filter((l) => l.estado === "Cerrado").length ?? 0;
  const conversion = total > 0 ? (cerrados / total) * 100 : 0;

  return { empresa, total, nuevos, conversion };
}

const statCards = [
  { key: "total" as const, label: "Total leads", icon: Users },
  { key: "nuevos" as const, label: "Leads nuevos", icon: UserPlus },
  { key: "conversion" as const, label: "Conversión", icon: TrendingUp },
];

export default async function DashboardPage() {
  const stats = await getEmpresaAndStats();

  if (!stats) {
    return <p className="text-muted-foreground">No se encontró tu empresa. Contacta soporte.</p>;
  }

  const { empresa, total, nuevos, conversion } = stats;
  const usagePct = empresa.leads_limite_mes > 0
    ? (empresa.leads_usados_mes / empresa.leads_limite_mes) * 100
    : 0;

  const values = { total, nuevos, conversion: formatNumber(conversion, 1) };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Panel de control
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{empresa.nombre_empresa}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/crm">Ver CRM</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/simulator">
              Simulador
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">
                {values[key]}
                {key === "conversion" ? "%" : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Uso del plan
            <span className="ml-2 font-normal capitalize text-muted-foreground">
              ({empresa.plan ?? "sin plan"})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {empresa.leads_usados_mes} de {empresa.leads_limite_mes} leads este mes
            </span>
            <span className="font-medium">{formatNumber(usagePct, 0)}%</span>
          </div>
          <Progress value={usagePct} className="h-1.5" />
          {empresa.estado_suscripcion !== "active" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200/60 bg-amber-50/50 px-4 py-3">
              <p className="text-sm text-amber-900/80">
                Suscripción inactiva. Activa un plan para recibir leads en el widget.
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/subscription">Activar plan</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
