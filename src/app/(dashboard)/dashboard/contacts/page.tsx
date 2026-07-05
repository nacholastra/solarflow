"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/utils";

export default function ContactsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: equipo } = await supabase.from("equipo").select("empresa_id").eq("usuario_id", user.id).single();
    if (!equipo) return;
    const { data, error } = await supabase.from("leads").select("*").eq("empresa_id", equipo.empresa_id).order("created_at", { ascending: false });
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else setLeads(data ?? []);
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  const filtered = leads.filter((l) => {
    const q = filter.toLowerCase();
    return l.nombre.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.ciudad?.toLowerCase().includes(q) ?? false);
  });

  function handleExport() {
    exportToCsv(
      ["Nombre", "Email", "Teléfono", "Ciudad", "Estado", "kWp", "Ahorro anual", "Fecha"],
      filtered.map((l) => [
        l.nombre, l.email, l.telefono, l.ciudad ?? "", l.estado,
        l.kwp_estimado ?? "", l.ahorro_anual_eur ?? "", new Date(l.created_at).toLocaleDateString("es-ES"),
      ]),
      `leads-solarflow-${Date.now()}.csv`,
    );
    toast({ title: "CSV exportado" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Base de Contactos</h1>
          <p className="text-muted-foreground">{filtered.length} contactos</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {["Nombre", "Email", "Teléfono", "Ciudad", "Estado", "Ahorro/año", "Fecha"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{l.nombre}</td>
                <td className="px-4 py-3">{l.email}</td>
                <td className="px-4 py-3">{l.telefono}</td>
                <td className="px-4 py-3">{l.ciudad}</td>
                <td className="px-4 py-3">{l.estado}</td>
                <td className="px-4 py-3">{l.ahorro_anual_eur ? `${l.ahorro_anual_eur} €` : "—"}</td>
                <td className="px-4 py-3">{new Date(l.created_at).toLocaleDateString("es-ES")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
