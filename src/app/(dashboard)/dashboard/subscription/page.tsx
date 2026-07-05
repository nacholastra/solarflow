"use client";

import { useCallback, useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PLANS, type Currency, type PlanId } from "@/lib/config/plans";
import type { Empresa } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function SubscriptionPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [plan, setPlan] = useState<PlanId>("basic");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: equipo } = await supabase.from("equipo").select("empresa_id").eq("usuario_id", user.id).single();
    if (!equipo) return;
    const { data } = await supabase.from("empresas").select("*").eq("id", equipo.empresa_id).single();
    if (data) setEmpresa(data);
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  async function onApprove(data: { subscriptionID?: string | null }) {
    if (!empresa || !data.subscriptionID) return;

    const res = await fetch("/api/paypal/activate-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptionId: data.subscriptionID,
        plan,
        currency,
        empresaId: empresa.id,
      }),
    });

    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo activar el plan" });
      return;
    }

    toast({ title: "¡Suscripción activa!", description: `Plan ${PLANS[plan].name} activado` });
    void load();
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const paypalReady = clientId.length > 0 && !clientId.startsWith("your-");

  if (!empresa) return <p>Cargando...</p>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Suscripción y Perfil</h1>
        <p className="text-muted-foreground">
          Estado: <strong>{empresa.estado_suscripcion}</strong>
          {empresa.plan && ` — Plan ${empresa.plan}`}
        </p>
      </div>

      {empresa.estado_suscripcion === "active" ? (
        <Card>
          <CardHeader>
            <CardTitle>Plan activo: {empresa.plan?.toUpperCase()}</CardTitle>
            <CardDescription>
              {empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads este mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noopener noreferrer">
                Gestionar en PayPal
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            {(["EUR", "USD"] as Currency[]).map((c) => (
              <Button key={c} variant={currency === c ? "default" : "outline"} onClick={() => setCurrency(c)}>
                {c}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(["basic", "pro"] as PlanId[]).map((p) => (
              <Card key={p} className={plan === p ? "ring-2 ring-primary" : ""} onClick={() => setPlan(p)}>
                <CardHeader>
                  <CardTitle>{PLANS[p].name}</CardTitle>
                  <CardDescription>{formatCurrency(PLANS[p].price, currency)}/mes</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>{PLANS[p].leadsLimit} leads/mes</p>
                  <p>{PLANS[p].teamLimit} usuarios</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {!paypalReady ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6 text-sm text-amber-900">
                PayPal no está configurado. Añade <code className="text-xs">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>,
                <code className="text-xs"> PAYPAL_CLIENT_SECRET</code> y los 4 Plan IDs en <code className="text-xs">.env.local</code>.
              </CardContent>
            </Card>
          ) : (
            <PayPalScriptProvider options={{ clientId, vault: true, intent: "subscription", currency }}>
              <PayPalButtons
                style={{ layout: "vertical", shape: "rect" }}
                createSubscription={async () => {
                  const res = await fetch("/api/paypal/create-subscription", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ plan, currency, empresaId: empresa.id }),
                  });
                  const json = (await res.json()) as { id?: string; error?: string };
                  if (!json.id) throw new Error(json.error ?? "Error al crear suscripción");
                  return json.id;
                }}
                onApprove={async (data) => { await onApprove(data); }}
                onError={(err) => toast({ variant: "destructive", title: "Error PayPal", description: String(err) })}
              />
            </PayPalScriptProvider>
          )}
        </>
      )}
    </div>
  );
}
