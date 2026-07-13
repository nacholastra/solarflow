import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { WidgetSimulator } from "@/components/widget/widget-simulator";
import {
  expireTrialIfNeeded,
  isSubscriptionUsable,
} from "@/lib/empresa/subscription-access";

export default async function WidgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServiceClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, slug, nombre_empresa, color_marca, logo_url, privacy_url, precio_eur_kwp, tarifa_kwh_override, ratio_autoconsumo, kwp_max, gtm_id, estado_suscripcion, trial_ends_at, paypal_subscription_id, plan")
    .eq("slug", slug)
    .single();

  if (!empresa) notFound();

  await expireTrialIfNeeded(supabase, empresa.id, empresa);

  if (!isSubscriptionUsable(empresa)) notFound();

  const widgetEmpresa = {
    ...empresa,
    gtm_id: empresa.plan === "pro" ? empresa.gtm_id : null,
  };

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-8 dark:bg-background">
      <WidgetSimulator empresa={widgetEmpresa} />
    </div>
  );
}
