"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "@/types/database";

export function KanbanCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`cursor-grab rounded-lg border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing sm:p-3 ${lead.es_prueba ? "border-dashed border-amber-300 bg-amber-50/50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium" title={lead.nombre}>{lead.nombre}</p>
        {lead.es_prueba && (
          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Prueba
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-xs text-muted-foreground">{lead.ciudad ?? lead.comunidad}</p>
      {lead.ahorro_anual_eur != null && (
        <p className="text-xs text-green-600 mt-1">~{lead.ahorro_anual_eur} €/año</p>
      )}
    </div>
  );
}
