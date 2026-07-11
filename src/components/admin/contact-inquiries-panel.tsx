"use client";

import { useMemo, useState } from "react";
import { Check, ExternalLink, Mail, Phone, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ContactInquiry = {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
  mensaje: string;
  gestionado: boolean;
  created_at: string;
};

type Filter = "pendientes" | "gestionadas" | "todas";

export function ContactInquiriesPanel({
  inquiries,
  onUpdated,
}: {
  inquiries: ContactInquiry[];
  onUpdated: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("pendientes");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => inquiries.filter((q) => !q.gestionado).length,
    [inquiries],
  );

  const filtered = useMemo(() => {
    if (filter === "pendientes") return inquiries.filter((q) => !q.gestionado);
    if (filter === "gestionadas") return inquiries.filter((q) => q.gestionado);
    return inquiries;
  }, [inquiries, filter]);

  async function toggleGestionado(id: string, gestionado: boolean) {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/contact-inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gestionado }),
    });
    const json = (await res.json()) as { error?: string };
    setUpdatingId(null);

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }

    toast({
      title: gestionado ? "Marcada como gestionada" : "Marcada como pendiente",
    });
    onUpdated();
  }

  return (
    <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              Consultas de contacto
              {pendingCount > 0 && (
                <Badge className="bg-solar text-solar-foreground">{pendingCount} pendientes</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Mensajes enviados desde el formulario de la landing (#contacto)
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "pendientes", label: "Pendientes" },
                { id: "gestionadas", label: "Gestionadas" },
                { id: "todas", label: "Todas" },
              ] as const
            ).map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={filter === item.id ? "secondary" : "outline"}
                className={cn(
                  filter !== item.id && "border-neutral-700 bg-transparent text-neutral-300",
                )}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-700 py-10 text-center text-sm text-neutral-500">
            {filter === "pendientes"
              ? "No hay consultas pendientes."
              : filter === "gestionadas"
                ? "No hay consultas gestionadas."
                : "Aún no has recibido consultas desde la landing."}
          </p>
        ) : (
          filtered.map((q) => (
            <article
              key={q.id}
              className={cn(
                "rounded-lg border p-4 text-sm",
                q.gestionado
                  ? "border-neutral-800 bg-neutral-950/60 opacity-80"
                  : "border-neutral-700 bg-neutral-950",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{q.nombre}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-neutral-700 text-xs",
                        q.gestionado ? "text-neutral-500" : "text-solar",
                      )}
                    >
                      {q.gestionado ? "Gestionada" : "Pendiente"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">
                    {q.empresa ? `${q.empresa} · ` : ""}
                    {q.email}
                    {q.telefono ? ` · ${q.telefono}` : ""}
                  </p>
                </div>
                <time className="text-xs text-neutral-500">
                  {new Date(q.created_at).toLocaleString("es-ES")}
                </time>
              </div>

              <p className="mt-3 whitespace-pre-wrap rounded-md bg-neutral-900/80 p-3 text-neutral-200">
                {q.mensaje}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="border-neutral-700" asChild>
                  <a href={`mailto:${encodeURIComponent(q.email)}`}>
                    <Mail className="size-3.5" />
                    Responder
                  </a>
                </Button>
                {q.telefono && (
                  <Button size="sm" variant="outline" className="border-neutral-700" asChild>
                    <a href={`tel:${q.telefono.replace(/\s/g, "")}`}>
                      <Phone className="size-3.5" />
                      Llamar
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={q.gestionado ? "outline" : "secondary"}
                  className={q.gestionado ? "border-neutral-700" : undefined}
                  disabled={updatingId === q.id}
                  onClick={() => toggleGestionado(q.id, !q.gestionado)}
                >
                  {q.gestionado ? (
                    <>
                      <RotateCcw className="size-3.5" />
                      Marcar pendiente
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      Marcar gestionada
                    </>
                  )}
                </Button>
              </div>
            </article>
          ))
        )}

        {inquiries.length > 0 && (
          <p className="pt-2 text-xs text-neutral-500">
            {filtered.length} mostradas · {inquiries.length} total ·{" "}
            <a
              href="/#contacto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-200"
            >
              Ver formulario en la landing
              <ExternalLink className="size-3" />
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
