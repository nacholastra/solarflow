"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Webhook } from "lucide-react";

interface IntegrationsData {
  webhook_url: string;
  rol: string;
}

export default function IntegrationsPage() {
  const [data, setData] = useState<IntegrationsData | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/empresa/integrations");
    const json = (await res.json()) as IntegrationsData & { error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    setData(json);
    setWebhookUrl(json.webhook_url ?? "");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/empresa/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhook_url: webhookUrl.trim() }),
    });
    const json = (await res.json()) as { error?: string; webhook_url?: string };
    setSaving(false);

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }

    toast({
      title: "Integración guardada",
      description: webhookUrl.trim()
        ? "Los nuevos leads se enviarán automáticamente a tu webhook."
        : "Webhook desactivado.",
    });
    setWebhookUrl(json.webhook_url ?? "");
    void load();
  }

  async function handleTest() {
    const url = webhookUrl.trim();
    if (!url) {
      toast({
        variant: "destructive",
        title: "URL requerida",
        description: "Introduce una URL de webhook para enviar la prueba.",
      });
      return;
    }

    setTesting(true);
    const res = await fetch("/api/empresa/integrations/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhook_url: url }),
    });
    const json = (await res.json()) as { error?: string; status?: number; message?: string };
    setTesting(false);

    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Error en la prueba",
        description: json.error,
      });
      return;
    }

    toast({
      title: "Webhook probado",
      description: `${json.message} (HTTP ${json.status})`,
    });
  }

  if (!data) return <p>Cargando...</p>;

  const isAdmin = data.rol === "admin";

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Integraciones"
        description="Conecta SolarFlow con Zapier, Make u otras herramientas vía webhooks"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook de leads
          </CardTitle>
          <CardDescription>
            Cada vez que un cliente complete el simulador y envíe sus datos, recibirás un POST
            JSON con toda la información del lead en la URL que configures aquí.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook_url">URL de Zapier o Make</Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={!isAdmin}
              />
              <p className="text-xs text-muted-foreground">
                Deja el campo vacío para desactivar el webhook. Solo se aceptan URLs HTTPS.
              </p>
            </div>

            {isAdmin ? (
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving || testing}>
                  {saving ? "Guardando..." : "Guardar integración"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || testing || !webhookUrl.trim()}
                  onClick={() => void handleTest()}
                >
                  {testing ? "Enviando prueba..." : "Probar webhook"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Solo el administrador de la cuenta puede modificar esta configuración.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formato del payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
{`{
  "event": "lead.created",
  "test": true,
  "lead": {
    "id": "uuid",
    "empresa_id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "telefono": "+34600000000",
    "ahorro_anual_eur": 850,
    "kwp_estimado": 4.2,
    ...
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
