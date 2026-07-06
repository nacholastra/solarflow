"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PLANS, getPlanPrice, type Currency, type PlanId } from "@/lib/config/plans";
import type { Empresa } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { useDashboardContext } from "@/components/dashboard/dashboard-provider";
import { PayPalSubscribeButtons } from "@/components/dashboard/paypal-subscribe-buttons";

type PlanChangeMode = "activate" | "upgrade" | "downgrade";

function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: Currency;
  onChange: (c: Currency) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Moneda de facturación:</span>
      {(["EUR", "USD"] as Currency[]).map((c) => (
        <Button key={c} type="button" variant={currency === c ? "default" : "outline"} size="sm" onClick={() => onChange(c)}>
          {c === "EUR" ? "Euros (€)" : "Dólares ($)"}
        </Button>
      ))}
    </div>
  );
}

export default function SubscriptionPage() {
  const { empresaId, refreshPlan } = useDashboardContext();
  const router = useRouter();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [plan, setPlan] = useState<PlanId>("basic");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [upgrading, setUpgrading] = useState(false);
  const [downgrading, setDowngrading] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("empresas")
      .select(
        "id, plan, moneda_facturacion, estado_suscripcion, leads_limite_mes, leads_usados_mes, paypal_subscription_id",
      )
      .eq("id", empresaId)
      .single();
    if (data) {
      setEmpresa(data as Empresa);
      setCurrency((data.moneda_facturacion as Currency) ?? "EUR");
      if (data.plan === "pro") {
        setUpgrading(false);
        setDowngrading(false);
      }
      if (data.plan === "basic") setDowngrading(false);
    }
    setLoading(false);
  }, [empresaId, supabase]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "pro") setUpgrading(true);
    if (params.get("downgrade") === "basic") setDowngrading(true);
  }, []);

  async function onApprove(subscriptionId: string, targetPlan: PlanId, mode: PlanChangeMode) {
    if (!empresa) return;

    const endpoints: Record<PlanChangeMode, string> = {
      activate: "/api/paypal/activate-subscription",
      upgrade: "/api/paypal/upgrade-subscription",
      downgrade: "/api/paypal/downgrade-subscription",
    };

    const payload =
      mode === "activate"
        ? {
            subscriptionId,
            plan: targetPlan,
            currency,
            empresaId: empresa.id,
          }
        : { empresaId: empresa.id, subscriptionId };

    const res = await fetch(endpoints[mode], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo actualizar el plan" });
      return;
    }

    const toastMessages: Record<PlanChangeMode, { title: string; description: string }> = {
      activate: {
        title: "¡Suscripción activa!",
        description: `Plan ${PLANS[targetPlan].name} activado`,
      },
      upgrade: {
        title: "¡Plan Pro activado!",
        description: `Ahora tienes ${PLANS.pro.leadsLimit} leads/mes`,
      },
      downgrade: {
        title: "Plan Basic activado",
        description: `Tu límite pasa a ${PLANS.basic.leadsLimit} leads/mes. Las funciones Pro se han desactivado.`,
      },
    };

    toast(toastMessages[mode]);
    setUpgrading(false);
    setDowngrading(false);
    void load();
    await refreshPlan();
    router.refresh();
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const paypalReady = clientId.length > 0 && !clientId.startsWith("your-");

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  if (!empresa) return <p className="text-muted-foreground">No se encontró la empresa.</p>;

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
              {empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads este mes · facturación en{" "}
              {empresa.moneda_facturacion}
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
            <CurrencyToggle currency={currency} onChange={setCurrency} />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-muted-foreground">Basic (actual)</p>
                <p className="font-semibold">{formatCurrency(getPlanPrice("basic", currency), currency)}/mes</p>
                <p>{PLANS.basic.leadsLimit} leads</p>
              </div>
              <div className="rounded-lg border-2 border-primary p-3">
                <p className="text-muted-foreground">Pro</p>
                <p className="font-semibold">{formatCurrency(getPlanPrice("pro", currency), currency)}/mes</p>
                <p>{PLANS.pro.leadsLimit} leads</p>
              </div>
            </div>

            {!upgrading ? (
              <Button onClick={() => setUpgrading(true)}>Mejorar a Pro</Button>
            ) : paypalReady ? (
              <PayPalSubscribeButtons
                clientId={clientId}
                plan="pro"
                currency={currency}
                empresaId={empresa.id}
                onApprove={(id) => onApprove(id, "pro", "upgrade")}
                onError={(msg) => toast({ variant: "destructive", title: "Error PayPal", description: msg })}
              />
            ) : (
              <p className="text-sm text-amber-700">PayPal no configurado</p>
            )}
          </CardContent>
        </Card>
      )}

      {isActive && isPro && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle>Cambiar a Basic</CardTitle>
            <CardDescription>
              Pasa de {PLANS.pro.leadsLimit} a {PLANS.basic.leadsLimit} leads/mes y {PLANS.basic.teamLimit} usuarios.
              Se desactivarán CSV, webhooks, GTM y marca blanca.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CurrencyToggle currency={currency} onChange={setCurrency} />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border-2 border-primary p-3">
                <p className="text-muted-foreground">Pro (actual)</p>
                <p className="font-semibold">{formatCurrency(getPlanPrice("pro", currency), currency)}/mes</p>
                <p>{PLANS.pro.leadsLimit} leads</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-muted-foreground">Basic</p>
                <p className="font-semibold">{formatCurrency(getPlanPrice("basic", currency), currency)}/mes</p>
                <p>{PLANS.basic.leadsLimit} leads</p>
              </div>
            </div>

            {!downgrading ? (
              <Button variant="outline" onClick={() => setDowngrading(true)}>
                Cambiar a Basic
              </Button>
            ) : paypalReady ? (
              <PayPalSubscribeButtons
                clientId={clientId}
                plan="basic"
                currency={currency}
                empresaId={empresa.id}
                onApprove={(id) => onApprove(id, "basic", "downgrade")}
                onError={(msg) => toast({ variant: "destructive", title: "Error PayPal", description: msg })}
              />
            ) : (
              <p className="text-sm text-amber-700">PayPal no configurado</p>
            )}
          </CardContent>
        </Card>
      )}

      {!isActive && (
        <>
          <CurrencyToggle currency={currency} onChange={setCurrency} />
          <p className="text-sm text-muted-foreground">
            Precios base en euros. El importe en dólares se calcula al tipo de cambio actual.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {(["basic", "pro"] as PlanId[]).map((p) => (
              <Card
                key={p}
                className={`cursor-pointer ${plan === p ? "ring-2 ring-primary" : ""}`}
                onClick={() => setPlan(p)}
              >
                <CardHeader>
                  <CardTitle>{PLANS[p].name}</CardTitle>
                  <CardDescription>
                    {formatCurrency(getPlanPrice(p, currency), currency)}/mes
                    {currency === "USD" && (
                      <span className="block text-xs">
                        ≈ {PLANS[p].priceEur} € al cambio actual
                      </span>
                    )}
                  </CardDescription>
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
            <PayPalSubscribeButtons
              clientId={clientId}
              plan={plan}
              currency={currency}
              empresaId={empresa.id}
              onApprove={(id) => onApprove(id, plan, "activate")}
              onError={(msg) => toast({ variant: "destructive", title: "Error PayPal", description: msg })}
            />
          )}
        </>
      )}
    </div>
  );
}
