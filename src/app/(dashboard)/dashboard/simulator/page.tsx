import { SimulatorPanel } from "@/components/dashboard/simulator-panel";
import { getSimulatorData } from "@/lib/dashboard/simulator-data";
import { requireDashboardContext } from "@/lib/dashboard/session";
import { getSiteUrl } from "@/lib/config/site";

export default async function SimulatorPage() {
  const context = await requireDashboardContext();
  const empresa = await getSimulatorData(context.empresaId);

  if (!empresa) {
    return <p className="text-muted-foreground">No se encontró la empresa.</p>;
  }

  return <SimulatorPanel empresa={empresa} appUrl={getSiteUrl()} />;
}
