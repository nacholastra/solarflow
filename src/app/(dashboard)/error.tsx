"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold">No se pudo cargar esta página</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ha ocurrido un error al cargar el panel. Tus datos están seguros; prueba de nuevo.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Volver al panel</Link>
        </Button>
      </div>
    </div>
  );
}
