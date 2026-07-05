import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export default async function DashboardPage() {
  const stats = await getEmpresaAndStats();

  if (!stats) {
    return <p className="text-muted-foreground">No se encontró tu empresa. Contacta soporte.</p>;
  }

  const { empresa, total, nuevos, conversion } = stats;
  const usagePct = empresa.leads_limite_mes > 0
    ? (empresa.leads_usados_mes / empresa.leads_limite_mes) * 100
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{empresa.nombre_empresa}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leads nuevos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{nuevos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatNumber(conversion, 1)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Uso del plan ({empresa.plan ?? "sin plan"})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads este mes</span>
            <span>{formatNumber(usagePct, 0)}%</span>
          </div>
          <Progress value={usagePct} />
          {empresa.estado_suscripcion !== "active" && (
            <p className="text-sm text-amber-600">
              Suscripción inactiva. Activa un plan para recibir leads en el widget.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
