import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WidgetSimulator } from "@/components/widget/widget-simulator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function SimulatorPreviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: equipo } = await supabase
    .from("equipo")
    .select("empresa_id")
    .eq("usuario_id", user.id)
    .single();

  if (!equipo) {
    return <p className="text-muted-foreground">No tienes empresa asignada.</p>;
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, slug, nombre_empresa, color_marca, logo_url, privacy_url, precio_eur_kwp, tarifa_kwh_override, ratio_autoconsumo, kwp_max, gtm_id, estado_suscripcion, leads_usados_mes, leads_limite_mes")
    .eq("id", equipo.empresa_id)
    .single();

  if (!empresa) {
    return <p className="text-muted-foreground">No se encontró tu empresa.</p>;
  }

  const isActive = empresa.estado_suscripcion === "active";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link href="/dashboard/simulator">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver a configuración
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Probar simulador</h1>
          <p className="text-muted-foreground mt-1">
            Completa el formulario como si fueras un cliente. Los leads se guardan en tu CRM.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/crm">Ver en CRM</Link>
          </Button>
          {isActive && (
            <Button variant="outline" asChild>
              <a href={`/widget/${empresa.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Widget público
              </a>
            </Button>
          )}
        </div>
      </div>

      {!isActive && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Modo prueba activo — no necesitas suscripción PayPal. Los leads se guardan igualmente.
        </div>
      )}

      {isActive && (
        <p className="text-sm text-muted-foreground">
          Plan activo · {empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads este mes
        </p>
      )}

      <div className="flex justify-center py-4 bg-muted/30 rounded-xl">
        <WidgetSimulator empresa={empresa} preview />
      </div>
    </div>
  );
}
