"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TariffParams } from "@/lib/solar/tariff-params";

const emptyForm = {
  periodo: "",
  precio_energia_medio: "0.13",
  peaje_te_medio: "0.034",
  cargo_sistema_medio: "0.029",
  precio_potencia_kw_mes: "0.08",
  alquiler_contador_mes: "0.81",
  iee_pct: "0.05112696",
  iva_pct: "21",
  precio_vertido_factor: "0.5",
  fuente: "",
  notas: "",
};

export function TarifasAdminPanel() {
  const [tariffs, setTariffs] = useState<TariffParams[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/tarifas");
    const json = (await res.json()) as { tariffs?: TariffParams[]; error?: string };
    setLoading(false);
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    setTariffs(json.tariffs ?? []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const active = tariffs.find((t) => t.estado === "active");
    if (active && !form.periodo) {
      const parts = active.periodo.split("-");
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      if (!Number.isFinite(y) || !Number.isFinite(m)) return;
      const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
      setForm({
        periodo: next,
        precio_energia_medio: String(active.precio_energia_medio),
        peaje_te_medio: String(active.peaje_te_medio),
        cargo_sistema_medio: String(active.cargo_sistema_medio),
        precio_potencia_kw_mes: String(active.precio_potencia_kw_mes),
        alquiler_contador_mes: String(active.alquiler_contador_mes),
        iee_pct: String(active.iee_pct),
        iva_pct: String(active.iva_pct),
        precio_vertido_factor: String(active.precio_vertido_factor),
        fuente: "",
        notas: "",
      });
    }
  }, [tariffs, form.periodo]);

  async function propose() {
    setSaving(true);
    const res = await fetch("/api/admin/tarifas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "propose" }),
    });
    const json = (await res.json()) as { created?: boolean; reason?: string; error?: string };
    setSaving(false);
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    toast({
      title: json.created ? "Borrador del mes creado" : "Sin cambios",
      description: json.reason,
    });
    await refresh();
  }

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/tarifas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "draft",
        periodo: form.periodo,
        precio_energia_medio: Number(form.precio_energia_medio),
        peaje_te_medio: Number(form.peaje_te_medio),
        cargo_sistema_medio: Number(form.cargo_sistema_medio),
        precio_potencia_kw_mes: Number(form.precio_potencia_kw_mes),
        alquiler_contador_mes: Number(form.alquiler_contador_mes),
        iee_pct: Number(form.iee_pct),
        iva_pct: Number(form.iva_pct),
        precio_vertido_factor: Number(form.precio_vertido_factor),
        fuente: form.fuente || null,
        notas: form.notas || null,
      }),
    });
    const json = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    toast({ title: "Borrador guardado" });
    await refresh();
  }

  async function activate(id: string, periodo: string) {
    if (!confirm(`¿Activar ${periodo} y propagar a todas las localidades?`)) return;
    setSaving(true);
    const res = await fetch("/api/admin/tarifas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate", id }),
    });
    const json = (await res.json()) as { error?: string; updatedLocalidades?: number };
    setSaving(false);
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: json.error });
      return;
    }
    toast({
      title: "Tarifa activa",
      description: `Propagado a ${json.updatedLocalidades ?? 0} localidades.`,
    });
    await refresh();
  }

  const active = tariffs.find((t) => t.estado === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tarifas del simulador</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semi-automático: el cron del día 1 propone un borrador. Vos revisás y publicás. Hasta entonces
          el simulador sigue con el periodo activo.
        </p>
      </div>

      {active && (
        <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
          <CardHeader>
            <CardTitle className="text-base">Periodo activo: {active.periodo}</CardTitle>
            <CardDescription className="text-neutral-400">
              Energía {active.precio_energia_medio} €/kWh · Vertido ×{active.precio_vertido_factor} ·
              IEE {(active.iee_pct * 100).toFixed(3)}%
              {active.activated_at
                ? ` · Activado ${new Date(active.activated_at).toLocaleDateString("es-ES")}`
                : ""}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-neutral-700"
          disabled={saving}
          onClick={() => void propose()}
        >
          Proponer borrador del mes
        </Button>
        <Button size="sm" variant="ghost" disabled={loading || saving} onClick={() => void refresh()}>
          Refrescar
        </Button>
      </div>

      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <CardTitle className="text-base">Nuevo / editar borrador</CardTitle>
          <CardDescription className="text-neutral-400">
            Periodo en formato YYYY-MM. No afecta al simulador hasta activarlo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveDraft} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["periodo", "Periodo (YYYY-MM)"],
                ["precio_energia_medio", "Energía €/kWh"],
                ["peaje_te_medio", "Peaje TE €/kWh"],
                ["cargo_sistema_medio", "Cargo sistema €/kWh"],
                ["precio_potencia_kw_mes", "Potencia €/kW·mes"],
                ["alquiler_contador_mes", "Alquiler contador €/mes"],
                ["iee_pct", "IEE (fracción, ej. 0.051)"],
                ["iva_pct", "IVA %"],
                ["precio_vertido_factor", "Factor vertido (0–1)"],
                ["fuente", "Fuente"],
                ["notas", "Notas"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-neutral-400">{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="border-neutral-700 bg-neutral-950"
                  required={key === "periodo" || key.startsWith("precio") || key.includes("pct") || key.includes("peaje") || key.includes("cargo") || key.includes("alquiler") || key.includes("iee") || key.includes("iva") || key.includes("vertido")}
                />
              </div>
            ))}
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={saving}>
                Guardar borrador
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">Cargando…</p>
          ) : tariffs.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">
              Sin periodos. Ejecutá la migración 015 en Supabase.
            </p>
          ) : (
            <ul>
              {tariffs.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.periodo}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-neutral-700 text-xs",
                          t.estado === "active" && "border-solar/50 text-solar",
                          t.estado === "draft" && "text-amber-400",
                        )}
                      >
                        {t.estado}
                      </Badge>
                      {t.propuesta_automatica && (
                        <span className="text-[10px] text-neutral-500">auto</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {t.precio_energia_medio} €/kWh · vertido ×{t.precio_vertido_factor}
                      {t.fuente ? ` · ${t.fuente}` : ""}
                    </p>
                  </div>
                  {t.estado === "draft" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={saving}
                      onClick={() => void activate(t.id, t.periodo)}
                    >
                      Activar y propagar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
