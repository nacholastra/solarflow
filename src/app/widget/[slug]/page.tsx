import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { WidgetSimulator } from "@/components/widget/widget-simulator";

export default async function WidgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServiceClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, slug, nombre_empresa, color_marca, logo_url, privacy_url, precio_eur_kwp, tarifa_kwh_override, ratio_autoconsumo, kwp_max, gtm_id, estado_suscripcion")
    .eq("slug", slug)
    .eq("estado_suscripcion", "active")
    .single();

  if (!empresa) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <WidgetSimulator empresa={empresa} />
    </div>
  );
}
