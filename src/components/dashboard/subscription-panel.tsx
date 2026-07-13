"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { PLANS, getPlanPrice, type Currency, type PlanId } from "@/lib/config/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { useDashboardContext } from "@/components/dashboard/dashboard-provider";
import { PayPalSubscribeButtons } from "@/components/dashboard/paypal-subscribe-buttons";
import type { SubscriptionEmpresa } from "@/lib/dashboard/subscription-data";
import { getTrialDaysRemaining, isTrialActive } from "@/lib/empresa/subscription-access";
import { TRIAL_DAYS } from "@/lib/config/trial";

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

export function SubscriptionPanel({
  empresa,
  upgradeInitially,
  downgradeInitially,
}: {
  empresa: SubscriptionEmpresa;
  upgradeInitially: boolean;
  downgradeInitially: boolean;
}) {
  const { refreshPlan } = useDashboardContext();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanId>("basic");
  const [currency, setCurrency] = useState<Currency>((empresa.moneda_facturacion as Currency) ?? "EUR");
  const [upgrading, setUpgrading] = useState(upgradeInitially);
  const [downgrading, setDowngrading] = useState(downgradeInitially);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function onApprove(subscriptionId: string, targetPlan: PlanId, mode: PlanChangeMode) {
    const endpoints: Record<PlanChangeMode, string> = {
      activate: "/api/paypal/activate-subscription",
      upgrade: "/api/paypal/upgrade-subscription",
      downgrade: "/api/paypal/downgrade-subscription",
    };

    const payload =
      mode === "activate"
        ? { subscriptionId, plan: targetPlan, currency, empresaId: empresa.id }
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
      activate: { title: "¡Suscripción activa!", description: `Plan ${PLANS[targetPlan].name} activado` },
      upgrade: { title: "¡Plan Pro activado!", description: `Ahora tienes ${PLANS.pro.leadsLimit} leads/mes` },
      downgrade: {
        title: "Plan Basic activado",
        description: `Tu límite pasa a ${PLANS.basic.leadsLimit} leads/mes. Las funciones Pro se han desactivado.`,
      },
    };

    toast(toastMessages[mode]);
    setUpgrading(false);
    setDowngrading(false);
    await refreshPlan();
    router.refresh();
  }

  async function handleCancel() {
    setCancelling(true);
    const res = await fetch("/api/paypal/cancel-subscription", { method: "POST" });
    const json = (await res.json()) as { error?: string };
    setCancelling(false);
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error ?? "No se pudo cancelar" });
      return;
    }
    setCancelOpen(false);
    toast({
      title: "Suscripción cancelada",
      description: "Tu cuenta queda en solo lectura. Puedes reactivar un plan cuando quieras.",
    });
    await refreshPlan();
    router.refresh();
  }

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const paypalReady = clientId.length > 0 && !clientId.startsWith("your-");
  const isActive = empresa.estado_suscripcion === "active";
  const onTrial = isTrialActive({
    estado_suscripcion: empresa.estado_suscripcion,
    trial_ends_at: empresa.trial_ends_at,
    paypal_subscription_id: empresa.paypal_subscription_id,
  });
  const trialDaysLeft = onTrial ? getTrialDaysRemaining(empresa.trial_ends_at) : null;
  const isBasic = empresa.plan === "basic";
  const isPro = empresa.plan === "pro";
  const proximoCobro = empresa.proximo_cobro;

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="Suscripción"
        description={`Estado: ${empresa.estado_suscripcion}${empresa.plan ? ` — Plan ${empresa.plan.toUpperCase()}` : ""}`}
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/profile">Mi perfil</Link>
        </Button>
      </PageHeader>

      {onTrial && trialDaysLeft !== null && (
        <Card className="border-info/30 bg-info/5">
          <CardHeader>
            <CardTitle className="text-base">Periodo de prueba activo</CardTitle>
            <CardDescription>
              Te quedan {trialDaysLeft} día{trialDaysLeft === 1 ? "" : "s"} de los {TRIAL_DAYS} días
              gratuitos. Activa el pago con PayPal para continuar sin interrupciones cuando termine.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {isActive && !onTrial && (
        <Card>
          <CardHeader>
            <CardTitle>Plan activo: {empresa.plan?.toUpperCase() ?? "—"}</CardTitle>
            <CardDescription>
              {empresa.leads_usados_mes} / {empresa.leads_limite_mes} leads este mes · facturación en{" "}
              {empresa.moneda_facturacion}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <p className="font-medium">Facturación mensual automática</p>
              <p className="text-muted-foreground">
                {proximoCobro
                  ? `Próximo cobro: ${new Date(proximoCobro).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}`
                  : "Se renueva automáticamente cada mes."}{" "}
                Te avisaremos 5 días antes de cada cobro.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noopener noreferrer">
                  Gestionar en PayPal
                </a>
              </Button>
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                Cancelar suscripción
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={cancelOpen} onOpenChange={(o) => !cancelling && setCancelOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar tu suscripción?</DialogTitle>
            <DialogDescription>
              Se detendrá la facturación mensual y tu cuenta pasará a <strong>solo lectura</strong> (sin plan).
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
            {[
              "No se te volverá a cobrar.",
              "Podrás ver tus datos y leads, pero no editarlos.",
              "El widget dejará de recibir nuevos leads.",
              "Puedes reactivar un plan cuando quieras.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                {item}
              </li>
            ))}
          </ul>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" disabled={cancelling} onClick={() => setCancelOpen(false)}>
              Mantener suscripción
            </Button>
            <Button type="button" variant="destructive" disabled={cancelling} onClick={handleCancel}>
              {cancelling ? "Cancelando…" : "Sí, cancelar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {(!isActive || onTrial) && !empresa.paypal_subscription_id && (
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
                      <span className="block text-xs">≈ {PLANS[p].priceEur} € al cambio actual</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>{PLANS[p].leadsLimit} leads/mes</p>
                  <p>{PLANS[p].teamLimit} usuarios</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {!paypalReady ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6 text-sm text-amber-900">PayPal no está configurado.</CardContent>
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
