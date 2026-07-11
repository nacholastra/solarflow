"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Mail, Phone, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { cn } from "@/lib/utils";
import { useAdminInquiries, type ContactInquiry } from "@/components/admin/admin-inquiries-context";

type Filter = "pendientes" | "gestionadas" | "todas";

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function ContactInquiriesView() {
  const { inquiries, selectedId, setSelectedId, refresh, newInquiryIds, pendingCount, dismissBellAlert } =
    useAdminInquiries();
  const [filter, setFilter] = useState<Filter>("pendientes");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactInquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "pendientes") return inquiries.filter((q) => !q.gestionado);
    if (filter === "gestionadas") return inquiries.filter((q) => q.gestionado);
    return inquiries;
  }, [inquiries, filter]);

  const selected = useMemo(
    () => inquiries.find((q) => q.id === selectedId) ?? null,
    [inquiries, selectedId],
  );

  useEffect(() => {
    dismissBellAlert();
  }, [dismissBellAlert]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((q) => q.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId, setSelectedId]);

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

    toast({ title: gestionado ? "Marcada como gestionada" : "Marcada como pendiente" });
    await refresh();
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/contact-inquiries/${deleteTarget.id}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string };
    setDeleting(false);

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }

    setDeleteTarget(null);
    toast({ title: "Mensaje eliminado" });
    await refresh();
  }

  async function handleRefresh() {
    setRefreshing(true);
    const ok = await refresh();
    setRefreshing(false);

    if (ok) {
      toast({ title: "Lista actualizada" });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los mensajes.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mensajes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultas recibidas desde el formulario de la landing.
        </p>
      </div>

      <Card className="overflow-hidden border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader className="border-b border-neutral-800 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Bandeja de contacto</CardTitle>
              <CardDescription className="text-neutral-400">
                {pendingCount > 0
                  ? `${pendingCount} pendiente${pendingCount === 1 ? "" : "s"} por revisar`
                  : "Sin mensajes pendientes"}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-neutral-700 text-xs"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
                Refrescar
              </Button>
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
                  variant={filter === item.id ? "secondary" : "ghost"}
                  className={cn("h-8 text-xs", filter !== item.id && "text-neutral-400")}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid min-h-[32rem] gap-0 p-0 lg:grid-cols-[minmax(0,18rem)_1fr]">
          <div className="max-h-80 overflow-y-auto border-b border-neutral-800 lg:max-h-none lg:border-b-0 lg:border-r">
            {filtered.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-neutral-500">
                {filter === "pendientes"
                  ? "No hay mensajes pendientes."
                  : filter === "gestionadas"
                    ? "No hay mensajes gestionados."
                    : "Aún no hay mensajes."}
              </p>
            ) : (
              <ul>
                {filtered.map((q) => (
                  <InquiryListItem
                    key={q.id}
                    inquiry={q}
                    selected={q.id === selectedId}
                    isNew={newInquiryIds.has(q.id)}
                    onSelect={() => setSelectedId(q.id)}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="min-h-[20rem] overflow-y-auto">
            {selected ? (
              <InquiryDetail
                inquiry={selected}
                updating={updatingId === selected.id}
                onToggleGestionado={toggleGestionado}
                onDelete={() => setDeleteTarget(selected)}
              />
            ) : (
              <p className="px-4 py-12 text-center text-sm text-neutral-500">
                Selecciona un mensaje para ver el detalle.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        <a
          href="/#contacto"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          Ver formulario en la landing
          <ExternalLink className="size-3" />
        </a>
      </p>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title="¿Eliminar este mensaje?"
        entityName={deleteTarget?.nombre ?? ""}
        consequences={[
          "Se borrará de forma permanente de la base de datos",
          "Útil solo para limpiar envíos de prueba",
        ]}
        confirmLabel="Eliminar mensaje"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        dark
      />
    </div>
  );
}

function InquiryListItem({
  inquiry,
  selected,
  isNew,
  onSelect,
}: {
  inquiry: ContactInquiry;
  selected: boolean;
  isNew: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full border-b border-neutral-800/80 px-4 py-3 text-left transition-colors hover:bg-neutral-950",
          selected && "bg-neutral-950",
          isNew && "border-l-2 border-l-solar bg-solar/5",
          !inquiry.gestionado && !selected && !isNew && "border-l-2 border-l-neutral-600",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium">{inquiry.nombre}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            {isNew && (
              <span className="size-2 rounded-full bg-solar" title="Nuevo" aria-label="Nuevo" />
            )}
            <time className="text-[10px] text-neutral-500">{formatRelative(inquiry.created_at)}</time>
          </div>
        </div>
        <p className="mt-0.5 truncate text-xs text-neutral-400">{inquiry.email}</p>
        <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{inquiry.mensaje}</p>
      </button>
    </li>
  );
}

function InquiryDetail({
  inquiry,
  updating,
  onToggleGestionado,
  onDelete,
}: {
  inquiry: ContactInquiry;
  updating: boolean;
  onToggleGestionado: (id: string, gestionado: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">{inquiry.nombre}</h2>
        <Badge
          variant="outline"
          className={cn(
            "border-neutral-700 text-xs",
            inquiry.gestionado ? "text-neutral-500" : "text-solar",
          )}
        >
          {inquiry.gestionado ? "Gestionada" : "Pendiente"}
        </Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-neutral-500">Correo</dt>
          <dd className="break-all">{inquiry.email}</dd>
        </div>
        {inquiry.empresa && (
          <div>
            <dt className="text-xs text-neutral-500">Empresa</dt>
            <dd>{inquiry.empresa}</dd>
          </div>
        )}
        {inquiry.telefono && (
          <div>
            <dt className="text-xs text-neutral-500">Teléfono</dt>
            <dd>{inquiry.telefono}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-neutral-500">Fecha</dt>
          <dd>{new Date(inquiry.created_at).toLocaleString("es-ES")}</dd>
        </div>
      </dl>

      <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <p className="mb-2 text-xs text-neutral-500">Mensaje</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
          {inquiry.mensaje}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="border-neutral-700" asChild>
          <a href={`mailto:${encodeURIComponent(inquiry.email)}`}>
            <Mail className="size-3.5" />
            Responder
          </a>
        </Button>
        {inquiry.telefono && (
          <Button size="sm" variant="outline" className="border-neutral-700" asChild>
            <a href={`tel:${inquiry.telefono.replace(/\s/g, "")}`}>
              <Phone className="size-3.5" />
              Llamar
            </a>
          </Button>
        )}
        <Button
          size="sm"
          variant={inquiry.gestionado ? "outline" : "secondary"}
          className={inquiry.gestionado ? "border-neutral-700" : undefined}
          disabled={updating}
          onClick={() => onToggleGestionado(inquiry.id, !inquiry.gestionado)}
        >
          {inquiry.gestionado ? (
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
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={updating}
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Eliminar (pruebas)
        </Button>
      </div>
    </div>
  );
}
