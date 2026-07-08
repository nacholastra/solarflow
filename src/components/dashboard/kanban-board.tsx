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
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LEAD_ESTADOS, type LeadEstado } from "@/lib/solar/types";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "@/types/database";
import { useInvalidateLeads, useLeads } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { KanbanColumn } from "./kanban-column";
import { LeadDetailModal } from "./lead-detail-modal";

export function KanbanBoard({ empresaId }: { empresaId: string }) {
  const { data: leads = [], isLoading } = useLeads(empresaId);
  const invalidateLeads = useInvalidateLeads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purging, setPurging] = useState(false);
  const supabase = createClient();

  const testLeadsCount = useMemo(() => leads.filter((l) => l.es_prueba).length, [leads]);

  async function purgeTestLeads() {
    setPurging(true);
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("empresa_id", empresaId)
      .eq("es_prueba", true);
    setPurging(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    setPurgeOpen(false);
    toast({ title: "Leads de prueba eliminados" });
    void invalidateLeads(empresaId);
  }

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
      {testLeadsCount > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Tienes <strong>{testLeadsCount}</strong> lead{testLeadsCount === 1 ? "" : "s"} de prueba.
            No cuentan en tu cuota mensual; puedes borrarlos cuando quieras.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-amber-300 bg-transparent text-amber-800 hover:bg-amber-100"
            onClick={() => setPurgeOpen(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Eliminar leads de prueba
          </Button>
        </div>
      )}

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

      <DeleteConfirmDialog
        open={purgeOpen}
        onOpenChange={setPurgeOpen}
        title="Eliminar leads de prueba"
        entityName={`${testLeadsCount} lead${testLeadsCount === 1 ? "" : "s"} de prueba`}
        consequences={[
          "Se borrarán todas las simulaciones marcadas como prueba.",
          "No afecta a tus leads reales ni a tu cuota mensual.",
          "Esta acción no se puede deshacer.",
        ]}
        confirmLabel="Eliminar pruebas"
        loading={purging}
        onConfirm={purgeTestLeads}
      />
    </>
  );
}
