"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type EmpresaRow = {
  id: string;
  nombre_empresa: string;
  slug: string;
  plan: "basic" | "pro" | null;
  estado_suscripcion: string;
  leads_limite_mes: number;
  leads_usados_mes: number;
  moneda_facturacion: string;
  owner_email: string;
  miembros: number;
  created_at: string;
};

const ESTADOS = ["pending", "active", "suspended", "cancelled"] as const;

export default function AdminPage() {
  const [empresas, setEmpresas] = useState<EmpresaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "basic" | "pro" | "none">("all");
  const [estadoFilter, setEstadoFilter] = useState<"all" | (typeof ESTADOS)[number]>("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/empresas");
    const json = (await res.json()) as { empresas?: EmpresaRow[]; error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      setLoading(false);
      return;
    }
    setEmpresas(json.empresas ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return empresas.filter((e) => {
      if (planFilter === "basic" && e.plan !== "basic") return false;
      if (planFilter === "pro" && e.plan !== "pro") return false;
      if (planFilter === "none" && e.plan) return false;
      if (estadoFilter !== "all" && e.estado_suscripcion !== estadoFilter) return false;
      if (!q) return true;
      return (
        e.nombre_empresa.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        e.owner_email.toLowerCase().includes(q)
      );
    });
  }, [empresas, filter, planFilter, estadoFilter]);

  async function updateEstado(id: string, estado: string) {
    const res = await fetch(`/api/admin/empresas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado_suscripcion: estado }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    toast({ title: "Estado actualizado" });
    void load();
  }

  async function updatePlan(id: string, plan: string) {
    const value = plan === "none" ? null : plan;
    const res = await fetch(`/api/admin/empresas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: value }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    toast({ title: "Plan actualizado" });
    void load();
  }

  async function deleteEmpresa(empresa: EmpresaRow) {
    const ok = window.confirm(
      `¿Eliminar "${empresa.nombre_empresa}" y todos sus datos? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;

    const res = await fetch(`/api/admin/empresas/${empresa.id}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    toast({ title: "Empresa eliminada" });
    void load();
  }

  const stats = useMemo(
    () => ({
      total: empresas.length,
      active: empresas.filter((e) => e.estado_suscripcion === "active").length,
      pro: empresas.filter((e) => e.plan === "pro").length,
      basic: empresas.filter((e) => e.plan === "basic").length,
    }),
    [empresas],
  );

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total empresas", value: stats.total },
          { label: "Activas", value: stats.active },
          { label: "Plan Pro", value: stats.pro },
          { label: "Plan Basic", value: stats.basic },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas registradas</CardTitle>
          <CardDescription>Gestiona planes, estado y eliminación de cuentas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              placeholder="Buscar por nombre, slug o email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
            >
              <option value="all">Todos los planes</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="none">Sin plan</option>
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value as typeof estadoFilter)}
            >
              <option value="all">Todos los estados</option>
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Empresa", "Plan", "Estado", "Leads", "Equipo", "Admin", "Alta", "Acciones"].map(
                    (h) => (
                      <th key={h} className="px-3 py-3 text-left font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-3">
                      <p className="font-medium">{e.nombre_empresa}</p>
                      <p className="text-xs text-muted-foreground">{e.slug}</p>
                    </td>
                    <td className="px-3 py-3 capitalize">
                      <select
                        className="rounded-md border bg-background px-2 py-1 text-xs capitalize"
                        value={e.plan ?? "none"}
                        onChange={(ev) => updatePlan(e.id, ev.target.value)}
                      >
                        <option value="none">Sin plan</option>
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="rounded-md border bg-background px-2 py-1 text-xs capitalize"
                        value={e.estado_suscripcion}
                        onChange={(ev) => updateEstado(e.id, ev.target.value)}
                      >
                        {ESTADOS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      {e.leads_usados_mes}/{e.leads_limite_mes}
                    </td>
                    <td className="px-3 py-3">{e.miembros}</td>
                    <td className="px-3 py-3 text-xs">{e.owner_email}</td>
                    <td className="px-3 py-3 text-xs">
                      {new Date(e.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteEmpresa(e)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No hay empresas con esos filtros</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{filtered.length} mostradas</Badge>
            <Badge variant="outline">{empresas.length} total</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
