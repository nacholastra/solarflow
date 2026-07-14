"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PlanUpgradeCard } from "@/components/dashboard/plan-upgrade-card";
import { BRAND } from "@/lib/config/brand";
import { canUseGtm } from "@/lib/config/plan-features";
import type { SimulatorEmpresa } from "@/lib/dashboard/simulator-data";

const WidgetSimulator = dynamic(
  () => import("@/components/widget/widget-simulator").then((m) => m.WidgetSimulator),
  {
    loading: () => <div className="h-[680px] w-full max-w-md animate-pulse rounded-xl bg-muted" />,
    ssr: false,
  },
);

export function SimulatorPanel({ empresa, appUrl }: { empresa: SimulatorEmpresa; appUrl: string }) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);
  const embedCode = `<iframe src="${appUrl}/widget/${empresa.slug}" width="100%" height="780" frameborder="0" style="border:none;border-radius:12px;"></iframe>`;
  const isActive = empresa.estado_suscripcion === "active";

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      main.style.overflowY = mq.matches ? "hidden" : "";
    };

    apply();
    mq.addEventListener("change", apply);
    return () => {
      main.style.overflowY = "";
      mq.removeEventListener("change", apply);
    };
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      color_marca: fd.get("color_marca") as string,
      logo_url: (fd.get("logo_url") as string) || "",
      privacy_url: (fd.get("privacy_url") as string) || "",
      precio_eur_kwp: Number(fd.get("precio_eur_kwp")),
      ratio_autoconsumo: Number(fd.get("ratio_autoconsumo")) / 100,
      kwp_max: Number(fd.get("kwp_max")),
      ...(canUseGtm(empresa.plan)
        ? { gtm_id: (fd.get("gtm_id") as string) || "" }
        : {}),
    };

    const res = await fetch("/api/empresa/simulator", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { error?: string };

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo guardar" });
      return;
    }

    toast({ title: "Configuración guardada", description: "La vista previa se actualiza al guardar" });
    router.refresh();
  }

  async function handleActivateTest() {
    setActivating(true);
    const res = await fetch("/api/empresa/activate-test", { method: "POST" });
    const json = (await res.json()) as { error?: string };
    setActivating(false);
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    toast({ title: "Plan de prueba activado", description: "Ya puedes usar el widget público" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100dvh-3rem)] lg:max-h-[calc(100dvh-3rem)] lg:overflow-hidden md:lg:h-[calc(100dvh-4rem)] md:lg:max-h-[calc(100dvh-4rem)]">
      <div className="hidden shrink-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start lg:gap-8">
        <div className="space-y-6">
          <PageHeader
            title="Simulador"
            description="Configura el widget y pruébalo en vivo. Los leads de prueba se guardan en tu CRM."
          >
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/crm">Ver CRM</Link>
              </Button>
              {isActive && (
                <Button variant="outline" asChild>
                  <a href={`${appUrl}/widget/${empresa.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                    Widget público
                  </a>
                </Button>
              )}
            </div>
          </PageHeader>

          {!isActive && process.env.NODE_ENV !== "production" && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-900">Activar para pruebas</CardTitle>
                <CardDescription className="text-amber-800">
                  Puedes probar el simulador aquí mismo sin plan, o activar el Basic de prueba (25 leads/mes).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleActivateTest} disabled={activating} size="sm">
                  {activating ? "Activando..." : "Activar plan Basic de prueba"}
                </Button>
              </CardContent>
            </Card>
          )}

          {isActive && (
            <p className="text-sm text-muted-foreground">
              Plan activo · {empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads este mes
            </p>
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Vista previa</h2>
          <p className="text-sm text-muted-foreground">
            Completa el formulario como un cliente. {!isActive && "Modo prueba — no requiere suscripción."}
          </p>
        </div>
      </div>

      <div className="shrink-0 space-y-6 lg:hidden">
        <PageHeader
          title="Simulador"
          description="Configura el widget y pruébalo en vivo. Los leads de prueba se guardan en tu CRM."
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/crm">Ver CRM</Link>
            </Button>
            {isActive && (
              <Button variant="outline" asChild>
                <a href={`${appUrl}/widget/${empresa.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  Widget público
                </a>
              </Button>
            )}
          </div>
        </PageHeader>

        {!isActive && process.env.NODE_ENV !== "production" && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-amber-900">Activar para pruebas</CardTitle>
              <CardDescription className="text-amber-800">
                Puedes probar el simulador aquí mismo sin plan, o activar el Basic de prueba (25 leads/mes).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleActivateTest} disabled={activating} size="sm">
                {activating ? "Activando..." : "Activar plan Basic de prueba"}
              </Button>
            </CardContent>
          </Card>
        )}

        {isActive && (
          <p className="text-sm text-muted-foreground">
            Plan activo · {empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads este mes
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
        <aside className="order-2 min-h-0 min-w-0 space-y-6 lg:order-1 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Branding y parámetros de cálculo ROI</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="color_marca">Color de marca (HEX)</Label>
                  <Input
                    id="color_marca"
                    name="color_marca"
                    defaultValue={empresa.color_marca}
                    placeholder="#F59E0B"
                    key={`color-${empresa.id}-${empresa.color_marca}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL del logo</Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    defaultValue={empresa.logo_url ?? ""}
                    placeholder="https://..."
                    key={`logo-${empresa.id}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacy_url">URL política de privacidad (RGPD)</Label>
                  <Input
                    id="privacy_url"
                    name="privacy_url"
                    defaultValue={empresa.privacy_url ?? ""}
                    key={`privacy-${empresa.id}`}
                  />
                </div>
                {canUseGtm(empresa.plan) ? (
                  <div className="space-y-2">
                    <Label htmlFor="gtm_id">Google Tag Manager ID</Label>
                    <Input
                      id="gtm_id"
                      name="gtm_id"
                      defaultValue={empresa.gtm_id ?? ""}
                      placeholder="GTM-XXXXXXX"
                      key={`gtm-${empresa.id}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mide conversiones de campañas (Google Ads, Meta Ads) en tu widget público.
                    </p>
                  </div>
                ) : (
                  <PlanUpgradeCard
                    title="Google Tag Manager (Plan Pro)"
                    description="Integra GTM en tu widget para medir conversiones de tus campañas de marketing."
                  />
                )}
                <hr />
                <p className="text-sm font-medium">Parámetros ROI</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="precio_eur_kwp">Precio instalación (€/kWp)</Label>
                    <Input
                      id="precio_eur_kwp"
                      name="precio_eur_kwp"
                      type="number"
                      defaultValue={empresa.precio_eur_kwp}
                      key={`kwp-${empresa.id}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ratio_autoconsumo">% autoconsumo</Label>
                    <Input
                      id="ratio_autoconsumo"
                      name="ratio_autoconsumo"
                      type="number"
                      defaultValue={Math.round(empresa.ratio_autoconsumo * 100)}
                      key={`ratio-${empresa.id}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kwp_max">kWp máximo</Label>
                    <Input
                      id="kwp_max"
                      name="kwp_max"
                      type="number"
                      defaultValue={empresa.kwp_max}
                      key={`max-${empresa.id}`}
                    />
                  </div>
                </div>
                <Button type="submit">Guardar cambios</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Código para embeber</CardTitle>
              <CardDescription>Pega este iframe en la web de tu cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-xs">{embedCode}</pre>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(embedCode);
                  toast({ title: "Copiado al portapapeles" });
                }}
              >
                Copiar código
              </Button>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">{BRAND.disclaimer}</p>
        </aside>

        <div className="order-1 flex min-h-0 shrink-0 flex-col lg:order-2 lg:w-[min(100%,420px)]">
          <div className="sticky top-0 z-10 -mx-4 shrink-0 border-b border-border/60 bg-background/95 px-4 pb-4 backdrop-blur-sm md:-mx-8 md:px-8 lg:mx-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:backdrop-blur-none">
            <div className="mb-3 shrink-0 space-y-1.5 lg:hidden">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Vista previa</h2>
              <p className="text-sm text-muted-foreground">
                Completa el formulario como un cliente. {!isActive && "Modo prueba — no requiere suscripción."}
              </p>
            </div>
            <div className="flex max-h-[min(58dvh,680px)] justify-center overflow-y-auto overscroll-contain rounded-xl bg-muted/30 p-3 sm:max-h-[min(62dvh,680px)] sm:p-4 lg:min-h-0 lg:max-h-full lg:flex-1">
              <WidgetSimulator
                key={empresa.updated_at ?? empresa.id}
                empresa={{
                  ...empresa,
                  gtm_id: canUseGtm(empresa.plan) ? empresa.gtm_id : null,
                }}
                preview
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
