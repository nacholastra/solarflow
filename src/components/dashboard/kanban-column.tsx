"use client";

import { useDroppable } from "@dnd-kit/core";
import type { LeadEstado } from "@/lib/solar/types";
import type { Lead } from "@/types/database";
import { KanbanCard } from "./kanban-card";

export function KanbanColumn({
  estado,
  leads,
  onLeadClick,
}: {
  estado: LeadEstado;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-0 flex-col rounded-xl p-2.5 transition-colors sm:p-3 ${isOver ? "bg-primary/10" : "bg-muted/50"}`}
    >
      <h3 className="mb-2 truncate text-xs font-semibold sm:mb-3 sm:text-sm" title={estado}>
        {estado} <span className="text-muted-foreground">({leads.length})</span>
      </h3>
      <div className="flex max-h-[calc(100vh-14rem)] flex-col gap-2 overflow-y-auto min-h-[120px]">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
        ))}
      </div>
    </div>
  );
}
