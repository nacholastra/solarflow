"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { useDashboardContext } from "@/components/dashboard/dashboard-provider";
import { useLeads } from "@/hooks/use-leads";
import { exportToCsv } from "@/lib/utils";

export default function ContactsPage() {
  const { empresaId } = useDashboardContext();
  const { data: leads = [], isLoading } = useLeads(empresaId);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.nombre.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.ciudad?.toLowerCase().includes(q) ?? false),
    );
  }, [filter, leads]);

  function handleExport() {
    exportToCsv(
      ["Nombre", "Email", "Teléfono", "Ciudad", "Estado", "kWp", "Ahorro anual", "Fecha"],
      filtered.map((l) => [
        l.nombre,
        l.email,
        l.telefono,
        l.ciudad ?? "",
        l.estado,
        l.kwp_estimado ?? "",
        l.ahorro_anual_eur ?? "",
        new Date(l.created_at).toLocaleDateString("es-ES"),
      ]),
      `leads-solarflow-${Date.now()}.csv`,
    );
    toast({ title: "CSV exportado" });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Contactos" description={`${filtered.length} contactos`}>
        <Button onClick={handleExport} variant="outline">
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Nombre", "Email", "Teléfono", "Ciudad", "Estado", "Ahorro/año", "Fecha"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ),
                )}
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
                  <td className="px-4 py-3">
                    {l.ahorro_anual_eur ? `${l.ahorro_anual_eur} €` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(l.created_at).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
