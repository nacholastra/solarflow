import { SubscriptionPanel } from "@/components/dashboard/subscription-panel";
import { getSubscriptionData } from "@/lib/dashboard/subscription-data";
import { requireDashboardContext } from "@/lib/dashboard/session";

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; downgrade?: string }>;
}) {
  const context = await requireDashboardContext();
  const empresa = await getSubscriptionData(context.empresaId);
  const params = await searchParams;

  if (!empresa) {
    return <p className="text-muted-foreground">No se encontró la empresa.</p>;
  }

  return (
    <SubscriptionPanel
      empresa={empresa}
      upgradeInitially={params.upgrade === "pro"}
      downgradeInitially={params.downgrade === "basic"}
    />
  );
}
