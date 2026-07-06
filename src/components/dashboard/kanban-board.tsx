"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import { LEAD_ESTADOS, type LeadEstado } from "@/lib/solar/types";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "@/types/database";
import { useInvalidateLeads, useLeads } from "@/hooks/use-leads";
import { KanbanColumn } from "./kanban-column";
import { LeadDetailModal } from "./lead-detail-modal";

export function KanbanBoard({ empresaId }: { empresaId: string }) {
  const { data: leads = [], isLoading } = useLeads(empresaId);
  const invalidateLeads = useInvalidateLeads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const supabase = createClient();

  const leadsByEstado = useMemo(() => {
    const map = Object.fromEntries(LEAD_ESTADOS.map((e) => [e, [] as Lead[]])) as Record<
      LeadEstado,
      Lead[]
    >;
    for (const lead of leads) {
      map[lead.estado]?.push(lead);
    }
    return map;
  }, [leads]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const activeLead = activeId ? leads.find((l) => l.id === activeId) : undefined;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id as string;
    let newEstado: LeadEstado | null = null;

    if (LEAD_ESTADOS.includes(over.id as LeadEstado)) {
      newEstado = over.id as LeadEstado;
    } else {
      const overLead = leads.find((l) => l.id === over.id);
      if (overLead) newEstado = overLead.estado;
    }

    if (!newEstado) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.estado === newEstado) return;

    const { error } = await supabase.from("leads").update({ estado: newEstado }).eq("id", leadId);
    if (error) {
      toast({ variant: "destructive", title: "Error al actualizar lead", description: error.message });
      void invalidateLeads(empresaId);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("lead_actividad").insert({
      lead_id: leadId,
      usuario_id: user?.id,
      estado_anterior: lead.estado,
      estado_nuevo: newEstado,
    });

    toast({ title: "Lead actualizado", description: `Movido a ${newEstado}` });
    void invalidateLeads(empresaId);
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid w-full min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {LEAD_ESTADOS.map((estado) => (
            <KanbanColumn
              key={estado}
              estado={estado}
              leads={leadsByEstado[estado]}
              onLeadClick={setSelectedLead}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? (
            <div className="rounded-lg border bg-card p-3 opacity-90 shadow-lg">
              <p className="font-medium">{activeLead.nombre}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={() => invalidateLeads(empresaId)}
        />
      )}
    </>
  );
}
