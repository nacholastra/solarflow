"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Algo salió mal</h1>
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error inesperado. Puedes reintentar o volver al inicio.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={reset}>Reintentar</Button>
            <Button variant="outline" asChild>
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
