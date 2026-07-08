"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { cn } from "@/lib/utils";

const ADMIN_DELETE_CONSEQUENCES = [
  "Se cancelará la suscripción PayPal si existe",
  "Se borrarán todos los leads y datos del CRM",
  "Se eliminarán los usuarios del equipo",
  "Se perderá toda la configuración de la empresa",
];

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
  const [planFilter, setPlanFilter] = useState<"all" | "basic" | "pro" | "sin_plan">("all");
  const [estadoFilter, setEstadoFilter] = useState<"all" | (typeof ESTADOS)[number]>("all");
  const [deleteTarget, setDeleteTarget] = useState<EmpresaRow | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      if (planFilter === "sin_plan" && e.plan !== null) return false;
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

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/empresas/${deleteTarget.id}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string };
    setDeleting(false);

    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }

    setDeleteTarget(null);
    toast({ title: "Empresa eliminada" });
    void load();
  }

  const stats = useMemo(
    () => ({
      total: empresas.length,
      active: empresas.filter((e) => e.estado_suscripcion === "active").length,
      pro: empresas.filter((e) => e.plan === "pro").length,
      basic: empresas.filter((e) => e.plan === "basic").length,
      sinPlan: empresas.filter((e) => e.plan === null).length,
    }),
    [empresas],
  );

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-neutral-900" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total empresas", value: stats.total },
          { label: "Activas", value: stats.active },
          { label: "Plan Pro", value: stats.pro },
          { label: "Plan Basic", value: stats.basic },
          { label: "Sin plan", value: stats.sinPlan },
        ].map((s) => (
          <Card key={s.label} className="border-neutral-800 bg-neutral-900 text-neutral-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-neutral-400">{s.label}</CardDescription>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <CardTitle>Empresas registradas</CardTitle>
          <CardDescription className="text-neutral-400">Gestiona planes, estado y eliminación de cuentas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              placeholder="Buscar por nombre, slug o email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm border-neutral-800 bg-neutral-950 text-neutral-100"
            />
            <select
              className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
            >
              <option value="all">Todos los planes</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="sin_plan">Sin plan</option>
            </select>
            <select
              className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
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

          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-neutral-900">
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
                  <tr key={e.id} className="border-t border-neutral-800">
                    <td className="px-3 py-3">
                      <p className="font-medium">{e.nombre_empresa}</p>
                      <p className="text-xs text-neutral-500">{e.slug}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          e.plan === "pro"
                            ? "bg-amber-500/15 text-amber-400"
                            : e.plan === "basic"
                              ? "bg-sky-500/15 text-sky-400"
                              : "bg-neutral-500/15 text-neutral-400",
                        )}
                      >
                        {e.plan ?? "Sin plan"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs capitalize text-neutral-100"
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
                        onClick={() => setDeleteTarget(e)}
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
            <p className="text-center text-sm text-neutral-500">No hay empresas con esos filtros</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
            <Badge variant="outline" className="border-neutral-700 text-neutral-400">{filtered.length} mostradas</Badge>
            <Badge variant="outline" className="border-neutral-700 text-neutral-400">{empresas.length} total</Badge>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title="¿Eliminar esta empresa?"
        entityName={deleteTarget?.nombre_empresa ?? ""}
        consequences={ADMIN_DELETE_CONSEQUENCES}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        dark
      />
    </div>
  );
}
