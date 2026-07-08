import { IntegrationsPanel } from "@/components/dashboard/integrations-panel";
import { getIntegrationsData } from "@/lib/dashboard/integrations-data";
import { requireDashboardContext } from "@/lib/dashboard/session";

export default async function IntegrationsPage() {
  const context = await requireDashboardContext();
  const data = await getIntegrationsData(context.empresaId, context.rol);

  if (!data) {
    return <p className="text-muted-foreground">No se encontró la configuración de integraciones.</p>;
  }

  return <IntegrationsPanel key={data.webhook_url} data={data} />;
}
