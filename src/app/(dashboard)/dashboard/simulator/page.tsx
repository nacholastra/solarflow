"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Empresa } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/config/brand";

export default function SimulatorConfigPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [embedCode, setEmbedCode] = useState("");
  const [activating, setActivating] = useState(false);
  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: equipo } = await supabase.from("equipo").select("empresa_id").eq("usuario_id", user.id).single();
    if (!equipo) return;
    const { data } = await supabase.from("empresas").select("*").eq("id", equipo.empresa_id).single();
    if (data) {
      setEmpresa(data);
      setEmbedCode(`<iframe src="${appUrl}/widget/${data.slug}" width="100%" height="680" frameborder="0" style="border:none;border-radius:12px;"></iframe>`);
    }
  }, [appUrl, supabase]);

  useEffect(() => { void load(); }, [load]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!empresa) return;
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("empresas").update({
      color_marca: fd.get("color_marca") as string,
      logo_url: (fd.get("logo_url") as string) || null,
      privacy_url: (fd.get("privacy_url") as string) || null,
      precio_eur_kwp: Number(fd.get("precio_eur_kwp")),
      ratio_autoconsumo: Number(fd.get("ratio_autoconsumo")) / 100,
      kwp_max: Number(fd.get("kwp_max")),
      gtm_id: (fd.get("gtm_id") as string) || null,
    }).eq("id", empresa.id);

    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else toast({ title: "Configuración guardada" });
    void load();
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
    void load();
  }

  if (!empresa) return <p>Cargando...</p>;

  const isActive = empresa.estado_suscripcion === "active";

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Configurar Simulador</h1>
          <p className="text-muted-foreground">Personaliza el widget y parámetros de cálculo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/simulator/preview">
              <Play className="h-4 w-4 mr-2" />
              Probar simulador
            </Link>
          </Button>
          {isActive && (
            <Button variant="outline" asChild>
              <a href={`${appUrl}/widget/${empresa.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Widget público
              </a>
            </Button>
          )}
        </div>
      </div>

      {!isActive && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">Activar para pruebas</CardTitle>
            <CardDescription className="text-amber-800">
              Sin PayPal puedes probar el simulador desde el dashboard o activar el plan Basic de prueba (25 leads/mes).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/simulator/preview">Probar ahora (sin activar plan)</Link>
            </Button>
            <Button onClick={handleActivateTest} disabled={activating}>
              {activating ? "Activando..." : "Activar plan Basic de prueba"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="color_marca">Color de marca (HEX)</Label>
              <Input id="color_marca" name="color_marca" defaultValue={empresa.color_marca} placeholder="#F59E0B" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input id="logo_url" name="logo_url" defaultValue={empresa.logo_url ?? ""} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy_url">URL política de privacidad (RGPD)</Label>
              <Input id="privacy_url" name="privacy_url" defaultValue={empresa.privacy_url ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gtm_id">Google Tag Manager ID</Label>
              <Input id="gtm_id" name="gtm_id" defaultValue={empresa.gtm_id ?? ""} placeholder="GTM-XXXXXXX" />
            </div>
            <hr />
            <CardTitle className="text-base pt-2">Parámetros ROI</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio_eur_kwp">Precio instalación (€/kWp)</Label>
                <Input id="precio_eur_kwp" name="precio_eur_kwp" type="number" defaultValue={empresa.precio_eur_kwp} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ratio_autoconsumo">% autoconsumo</Label>
                <Input id="ratio_autoconsumo" name="ratio_autoconsumo" type="number" defaultValue={Math.round(empresa.ratio_autoconsumo * 100)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kwp_max">kWp máximo</Label>
                <Input id="kwp_max" name="kwp_max" type="number" defaultValue={empresa.kwp_max} />
              </div>
            </div>
            <Button type="submit">Guardar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Código para embeber</CardTitle>
          <CardDescription>Pega este iframe en la web de tu cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap">{embedCode}</pre>
          <Button className="mt-3" variant="outline" onClick={() => { navigator.clipboard.writeText(embedCode); toast({ title: "Copiado al portapapeles" }); }}>
            Copiar código
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{BRAND.disclaimer}</p>
    </div>
  );
}
