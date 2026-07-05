"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between">
            <Dialog.Title className="text-xl font-bold">{lead.nombre}</Dialog.Title>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
