"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export function AdminContactNotice() {
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    void fetch("/api/admin/me")
      .then((res) => res.json())
      .then((json: { authenticated?: boolean; pendingInquiries?: number }) => {
        if (json.authenticated) {
          setPending(json.pendingInquiries ?? 0);
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  if (pending === null) return null;

  return (
    <div className="mt-8 flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm">
      <Shield className="mt-0.5 size-4 shrink-0 text-solar" aria-hidden />
      <p className="text-muted-foreground">
        Sesión de administrador activa.{" "}
        {pending > 0 ? (
          <>
            Tienes <strong className="font-medium text-foreground">{pending}</strong> consulta
            {pending === 1 ? "" : "s"} pendiente{pending === 1 ? "" : "s"}.
          </>
        ) : (
          "No hay consultas pendientes."
        )}{" "}
        <Link href="/admin" className="font-medium text-foreground underline-offset-4 hover:underline">
          Gestionar en el panel
        </Link>
        .
      </p>
    </div>
  );
}
