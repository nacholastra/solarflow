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
      className="cursor-grab rounded-lg border bg-card p-3 shadow-sm hover:shadow-md transition-shadow active:cursor-grabbing"
    >
      <p className="font-medium text-sm">{lead.nombre}</p>
      <p className="text-xs text-muted-foreground mt-1">{lead.ciudad ?? lead.comunidad}</p>
      {lead.ahorro_anual_eur != null && (
        <p className="text-xs text-green-600 mt-1">~{lead.ahorro_anual_eur} €/año</p>
      )}
    </div>
  );
}
