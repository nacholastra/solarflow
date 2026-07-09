"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { leadHasNotas } from "@/lib/dashboard/lead-notes";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const [savingNotas, setSavingNotas] = useState(false);
  const [deletingNotas, setDeletingNotas] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setNotas(lead.notas ?? "");
  }, [lead.id, lead.notas]);

  async function saveNotas() {
    setSavingNotas(true);
    const trimmed = notas.trim();
    const { error } = await supabase
      .from("leads")
      .update({ notas: trimmed || null })
      .eq("id", lead.id);
    setSavingNotas(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    toast({ title: trimmed ? "Notas guardadas" : "Nota eliminada" });
    onUpdated();
  }

  async function deleteNotas() {
    setDeletingNotas(true);
    const { error } = await supabase.from("leads").update({ notas: null }).eq("id", lead.id);
    setDeletingNotas(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    setNotas("");
    toast({ title: "Nota eliminada" });
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

  const hasNotas = leadHasNotas(lead) || Boolean(notas.trim());

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-card p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Dialog.Title className="text-xl font-bold">{lead.nombre}</Dialog.Title>
              {lead.es_prueba && (
                <span className="rounded-full bg-warning/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning-foreground">
                  Prueba
                </span>
              )}
              {hasNotas && (
                <span
                  className="size-2.5 shrink-0 rounded-full bg-destructive"
                  title="Tiene notas"
                  aria-label="Tiene notas"
                />
              )}
            </div>
            <Dialog.Close asChild>
              <button type="button" className="rounded p-1 hover:bg-muted" aria-label="Cerrar">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {lead.email}
            </p>
            <p>
              <span className="text-muted-foreground">Teléfono:</span> {lead.telefono}
            </p>
            <p>
              <span className="text-muted-foreground">Ubicación:</span> {lead.ciudad}, {lead.comunidad}
            </p>
            <p>
              <span className="text-muted-foreground">Tipo:</span> {lead.tipo_inmueble}
            </p>
            <p>
              <span className="text-muted-foreground">Estado:</span> {lead.estado}
            </p>
            {lead.kwp_estimado != null && (
              <div className="space-y-1 rounded-lg bg-muted p-3">
                <p>
                  kWp estimado: <strong>{formatNumber(lead.kwp_estimado)}</strong>
                </p>
                <p>
                  Ahorro anual: <strong>{lead.ahorro_anual_eur} €</strong>
                </p>
                <p>
                  Payback: <strong>{formatNumber(lead.payback_anos ?? 0)} años</strong>
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Añade una nota sobre este lead…"
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={saveNotas} disabled={savingNotas || deletingNotas}>
                {savingNotas ? "Guardando…" : "Guardar notas"}
              </Button>
              {(leadHasNotas(lead) || notas.trim()) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteNotas}
                  disabled={savingNotas || deletingNotas}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  {deletingNotas ? "Eliminando…" : "Eliminar nota"}
                </Button>
              )}
            </div>
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
