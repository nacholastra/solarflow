"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Mail, Phone, RotateCcw, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function ContactInquiriesSidebar() {
  const {
    inquiries,
    sidebarOpen,
    closeSidebar,
    selectedId,
    setSelectedId,
    refresh,
  } = useAdminInquiries();
  const [filter, setFilter] = useState<Filter>("pendientes");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, closeSidebar]);

  useEffect(() => {
    if (sidebarOpen && filtered.length > 0 && !filtered.some((q) => q.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [sidebarOpen, filtered, selectedId, setSelectedId]);

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

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:bg-black/30",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
        aria-hidden={!sidebarOpen}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Mensajes de contacto"
        aria-hidden={!sidebarOpen}
      >
        <header className="flex items-start justify-between gap-3 border-b border-neutral-800 px-4 py-4">
          <div>
            <h2 className="text-base font-semibold">Mensajes de contacto</h2>
            <p className="text-xs text-neutral-400">Formulario de la landing</p>
          </div>
          <Button variant="ghost" size="icon" onClick={closeSidebar} aria-label="Cerrar mensajes">
            <X className="size-4" />
          </Button>
        </header>

        <div className="flex gap-2 border-b border-neutral-800 px-4 py-3">
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
              className={cn(filter !== item.id && "text-neutral-400")}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="min-h-0 border-b border-neutral-800 md:w-[42%] md:border-b-0 md:border-r">
            <div className="h-48 overflow-y-auto md:h-full">
              {filtered.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-neutral-500">
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
                      onSelect={() => setSelectedId(q.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {selected ? (
              <InquiryDetail
                inquiry={selected}
                updating={updatingId === selected.id}
                onToggleGestionado={toggleGestionado}
              />
            ) : (
              <p className="px-4 py-10 text-center text-sm text-neutral-500">
                Selecciona un mensaje para ver el detalle.
              </p>
            )}
          </div>
        </div>

        <footer className="border-t border-neutral-800 px-4 py-2 text-xs text-neutral-500">
          <a
            href="/#contacto"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-neutral-300"
          >
            Ver formulario en la landing
            <ExternalLink className="size-3" />
          </a>
        </footer>
      </aside>
    </>
  );
}

function InquiryListItem({
  inquiry,
  selected,
  onSelect,
}: {
  inquiry: ContactInquiry;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full border-b border-neutral-800/80 px-4 py-3 text-left transition-colors hover:bg-neutral-900",
          selected && "bg-neutral-900",
          !inquiry.gestionado && !selected && "border-l-2 border-l-solar",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium">{inquiry.nombre}</p>
          <time className="shrink-0 text-[10px] text-neutral-500">
            {formatRelative(inquiry.created_at)}
          </time>
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
}: {
  inquiry: ContactInquiry;
  updating: boolean;
  onToggleGestionado: (id: string, gestionado: boolean) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">{inquiry.nombre}</h3>
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

      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-xs text-neutral-500">Correo</dt>
          <dd>{inquiry.email}</dd>
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

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
        <p className="mb-1 text-xs text-neutral-500">Mensaje</p>
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
      </div>
    </div>
  );
}
