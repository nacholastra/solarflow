"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, X } from "lucide-react";
import type { BillingStatus } from "@/lib/dashboard/billing-status";

const ESTADO_LABEL: Record<string, string> = {
  cancelled: "cancelada",
  suspended: "suspendida por un problema de pago",
  pending: "pendiente de activación",
};

export function AccountStatusBanner({ status }: { status: BillingStatus | null }) {
  const [dismissed, setDismissed] = useState(false);

  if (!status) return null;

  // Cuenta en solo lectura (sin plan / cancelada / suspendida / pendiente)
  if (status.estado !== "active") {
    return (
      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Tu cuenta está en <strong>solo lectura</strong> porque tu suscripción está{" "}
            {ESTADO_LABEL[status.estado] ?? status.estado}. Puedes ver tus datos, pero no
            editarlos ni recibir nuevos leads hasta reactivar un plan.
          </p>
        </div>
        <Link
          href="/dashboard/subscription"
          className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-center font-medium text-white transition-colors hover:bg-amber-700"
        >
          Reactivar plan
        </Link>
      </div>
    );
  }

  // Aviso de próximo cobro (5 días o menos)
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
      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Se renovará tu plan {status.plan ? status.plan.toUpperCase() : ""} <strong>{cuando}</strong>
            {fecha ? ` (${fecha})` : ""}. Si no quieres continuar, puedes cancelar antes del cobro.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard/subscription"
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-center font-medium text-white transition-colors hover:bg-sky-700"
          >
            Gestionar suscripción
          </Link>
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-sky-700 transition-colors hover:bg-sky-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
