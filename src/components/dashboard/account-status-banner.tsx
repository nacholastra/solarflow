"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillingStatus } from "@/lib/dashboard/billing-status";

const ESTADO_LABEL: Record<string, string> = {
  cancelled: "cancelada",
  suspended: "suspendida por un problema de pago",
  pending: "pendiente de activación",
};

export function AccountStatusBanner({ status }: { status: BillingStatus | null }) {
  const dismissKey =
    status?.proximoCobro != null ? `billing-dismiss:${status.proximoCobro}` : null;

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined" || !dismissKey) return false;
    return localStorage.getItem(dismissKey) === "1";
  });

  if (!status) return null;

  if (status.onTrial && status.trialDaysRemaining !== null) {
    const days = status.trialDaysRemaining;
    const cuando =
      days <= 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`;

    const earlyBirdNote =
      status.earlyBird && status.earlyBirdDiscountPct
        ? ` Tu −${status.earlyBirdDiscountPct}% de lanzamiento ya está reservado en la cuenta.`
        : "";

    const message =
      days > 7
        ? <>
            Te quedan <strong>{days} días</strong> de prueba para personalizar el simulador y captar leads.
            {earlyBirdNote} Activa el plan cuando quieras: sin permanencia.
          </>
        : days > 3
          ? <>
              Tu prueba termina {cuando}. Activa el plan para seguir recibiendo leads sin interrupciones.
              {earlyBirdNote}
            </>
          : <>
              La prueba termina <strong>{cuando}</strong>. Sin suscripción activa, el widget dejará de
              recibir leads nuevos.
              {earlyBirdNote}
            </>;

    return (
      <div className="surface-info mb-6 flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{message}</p>
        </div>
        <Button size="sm" className="shrink-0 bg-info-emphasis text-white hover:bg-info-emphasis/90" asChild>
          <Link href="/dashboard/subscription">Activar plan</Link>
        </Button>
      </div>
    );
  }

  if (status.estado !== "active") {
    return (
      <div className="surface-warning mb-6 flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Tu cuenta está en <strong>solo lectura</strong> porque tu suscripción está{" "}
            {ESTADO_LABEL[status.estado] ?? status.estado}. Puedes ver tus datos, pero no
            editarlos ni recibir nuevos leads hasta reactivar un plan.
          </p>
        </div>
        <Button size="sm" className="shrink-0 bg-warning-emphasis text-white hover:bg-warning-emphasis/90" asChild>
          <Link href="/dashboard/subscription">Reactivar plan</Link>
        </Button>
      </div>
    );
  }

  function dismissBillingNotice() {
    if (dismissKey) localStorage.setItem(dismissKey, "1");
    setDismissed(true);
  }

  if (
    !dismissed &&
    status.diasRestantes !== null &&
    status.diasRestantes >= 0 &&
    status.diasRestantes <= 5
  ) {
    const cuando =
      status.diasRestantes === 0
        ? "hoy"
        : status.diasRestantes === 1
          ? "mañana"
          : `en ${status.diasRestantes} días`;
    const fecha = status.proximoCobro
      ? new Date(status.proximoCobro).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
        })
      : null;

    return (
      <div className="surface-info mb-6 flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Se renovará tu plan {status.plan ? status.plan.toUpperCase() : ""} <strong>{cuando}</strong>
            {fecha ? ` (${fecha})` : ""}. Si no quieres continuar, puedes cancelar antes del cobro.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" className="bg-info-emphasis text-white hover:bg-info-emphasis/90" asChild>
            <Link href="/dashboard/subscription">Gestionar suscripción</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar aviso"
            onClick={dismissBillingNotice}
            className="size-8 text-info-foreground hover:bg-info/80"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
