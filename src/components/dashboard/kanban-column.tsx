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
      className={`flex w-72 shrink-0 flex-col rounded-xl p-3 transition-colors ${isOver ? "bg-primary/10" : "bg-muted/50"}`}
    >
      <h3 className="mb-3 text-sm font-semibold">
        {estado} <span className="text-muted-foreground">({leads.length})</span>
      </h3>
      <div className="flex flex-col gap-2 min-h-[120px]">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
        ))}
      </div>
    </div>
  );
}
