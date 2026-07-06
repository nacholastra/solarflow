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
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";

export default function SubscriptionPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [plan, setPlan] = useState<PlanId>("basic");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [upgrading, setUpgrading] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: equipo } = await supabase.from("equipo").select("empresa_id").eq("usuario_id", user.id).single();
    if (!equipo) return;
    const { data } = await supabase
      .from("empresas")
      .select(
        "id, plan, moneda_facturacion, estado_suscripcion, leads_limite_mes, leads_usados_mes, paypal_subscription_id",
      )
      .eq("id", equipo.empresa_id)
      .single();
    if (data) {
      setEmpresa(data as Empresa);
      setCurrency((data.moneda_facturacion as Currency) ?? "EUR");
      if (data.plan === "pro") setUpgrading(false);
    }
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("upgrade") === "pro") {
      setUpgrading(true);
    }
  }, []);

  async function onApprove(data: { subscriptionID?: string | null }, targetPlan: PlanId, isUpgrade = false) {
    if (!empresa || !data.subscriptionID) return;

    const endpoint = isUpgrade ? "/api/paypal/upgrade-subscription" : "/api/paypal/activate-subscription";
    const payload = isUpgrade
      ? { empresaId: empresa.id, subscriptionId: data.subscriptionID }
      : {
          subscriptionId: data.subscriptionID,
          plan: targetPlan,
          currency,
          empresaId: empresa.id,
        };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo activar el plan" });
      return;
    }

    toast({
      title: isUpgrade ? "¡Plan Pro activado!" : "¡Suscripción activa!",
      description: isUpgrade
        ? "Ahora tienes 250 leads/mes"
        : `Plan ${PLANS[targetPlan].name} activado`,
    });
    setUpgrading(false);
    void load();
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const paypalReady = clientId.length > 0 && !clientId.startsWith("your-");

  if (!empresa) return <p>Cargando...</p>;

  const isActive = empresa.estado_suscripcion === "active";
  const isBasic = empresa.plan === "basic";
  const isPro = empresa.plan === "pro";

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="Suscripción"
        description={`Estado: ${empresa.estado_suscripcion}${empresa.plan ? ` — Plan ${empresa.plan.toUpperCase()}` : ""}`}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/profile">Mi perfil</Link>
        </Button>
      </PageHeader>

      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Plan activo: {empresa.plan?.toUpperCase() ?? "—"}</CardTitle>
            <CardDescription>
              {empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads este mes · {empresa.moneda_facturacion}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noopener noreferrer">
                Gestionar en PayPal
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {isActive && isBasic && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle>Mejorar a Pro</CardTitle>
            <CardDescription>
              Pasa de {PLANS.basic.leadsLimit} a {PLANS.pro.leadsLimit} leads/mes y {PLANS.pro.teamLimit} usuarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-muted-foreground">Basic (actual)</p>
                <p className="font-semibold">{formatCurrency(PLANS.basic.price, currency)}/mes</p>
                <p>{PLANS.basic.leadsLimit} leads</p>
              </div>
              <div className="rounded-lg border-2 border-primary p-3">
                <p className="text-muted-foreground">Pro</p>
                <p className="font-semibold">{formatCurrency(PLANS.pro.price, currency)}/mes</p>
                <p>{PLANS.pro.leadsLimit} leads</p>
              </div>
            </div>

            {!upgrading ? (
              <Button onClick={() => setUpgrading(true)}>Mejorar a Pro</Button>
            ) : paypalReady ? (
              <PayPalScriptProvider options={{ clientId, vault: true, intent: "subscription", currency }}>
                <PayPalButtons
                  style={{ layout: "vertical", shape: "rect" }}
                  createSubscription={async () => {
                    const res = await fetch("/api/paypal/create-subscription", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ plan: "pro", currency, empresaId: empresa.id }),
                    });
                    const json = (await res.json()) as { id?: string; error?: string };
                    if (!json.id) throw new Error(json.error ?? "Error al crear suscripción Pro");
                    return json.id;
                  }}
                  onApprove={async (data) => { await onApprove(data, "pro", true); }}
                  onError={(err) => toast({ variant: "destructive", title: "Error PayPal", description: String(err) })}
                />
              </PayPalScriptProvider>
            ) : (
              <p className="text-sm text-amber-700">PayPal no configurado</p>
            )}
          </CardContent>
        </Card>
      )}

      {isActive && isPro && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Tienes el plan Pro con {PLANS.pro.leadsLimit} leads/mes. Gestiona tu suscripción en PayPal si necesitas cambios.
          </CardContent>
        </Card>
      )}

      {!isActive && (
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
              <Card
                key={p}
                className={`cursor-pointer ${plan === p ? "ring-2 ring-primary" : ""}`}
                onClick={() => setPlan(p)}
              >
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
                PayPal no está configurado.
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
                onApprove={async (data) => { await onApprove(data, plan, false); }}
                onError={(err) => toast({ variant: "destructive", title: "Error PayPal", description: String(err) })}
              />
            </PayPalScriptProvider>
          )}
        </>
      )}
    </div>
  );
}
