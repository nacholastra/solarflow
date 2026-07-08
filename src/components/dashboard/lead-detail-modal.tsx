"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { formatNumber } from "@/lib/utils";

export function LeadDetailModal({
  lead,
  onClose,
  onUpdated,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [notas, setNotas] = useState(lead.notas ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  async function saveNotas() {
    const { error } = await supabase.from("leads").update({ notas }).eq("id", lead.id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    toast({ title: "Notas guardadas" });
    onUpdated();
  }

  async function deleteLead() {
    setDeleting(true);
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    setDeleting(false);
    if (error) {
      toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
      return;
    }
    setDeleteOpen(false);
    toast({ title: "Lead eliminado" });
    onUpdated();
    onClose();
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Dialog.Title className="text-xl font-bold">{lead.nombre}</Dialog.Title>
              {lead.es_prueba && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Prueba
                </span>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <p><span className="text-muted-foreground">Email:</span> {lead.email}</p>
            <p><span className="text-muted-foreground">Teléfono:</span> {lead.telefono}</p>
            <p><span className="text-muted-foreground">Ubicación:</span> {lead.ciudad}, {lead.comunidad}</p>
            <p><span className="text-muted-foreground">Tipo:</span> {lead.tipo_inmueble}</p>
            <p><span className="text-muted-foreground">Estado:</span> {lead.estado}</p>
            {lead.kwp_estimado != null && (
              <div className="rounded-lg bg-muted p-3 space-y-1">
                <p>kWp estimado: <strong>{formatNumber(lead.kwp_estimado)}</strong></p>
                <p>Ahorro anual: <strong>{lead.ahorro_anual_eur} €</strong></p>
                <p>Payback: <strong>{formatNumber(lead.payback_anos ?? 0)} años</strong></p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Input id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
            <Button size="sm" onClick={saveNotas}>Guardar notas</Button>
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted-foreground">
              {lead.es_prueba
                ? "Lead de prueba — no cuenta en tu cuota mensual."
                : "Eliminar es permanente."}
            </p>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Eliminar lead
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar lead"
        entityName={lead.nombre}
        consequences={[
          "Se borrará el lead y su historial de actividad.",
          "Esta acción no se puede deshacer.",
        ]}
        confirmLabel="Eliminar lead"
        loading={deleting}
        onConfirm={deleteLead}
      />
    </Dialog.Root>
  );
}
