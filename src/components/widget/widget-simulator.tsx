"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sun } from "lucide-react";
import { gastoToKwh, kwhToGasto, desgloseFactura } from "@/lib/solar/billing-es";
import type { Localidad, SimulacionResultado, TipoInmueble } from "@/lib/solar/types";
import { CCAA_LIST } from "@/lib/solar/types";
import { BRAND } from "@/lib/config/brand";
import { getSiteUrl } from "@/lib/config/site";
import { canUseGtm, showWidgetWatermark } from "@/lib/config/plan-features";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calcularAhorroProyectado, INFLACION_ENERGIA_ANUAL } from "@/lib/solar/projection";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface EmpresaWidget {
  id: string;
  slug: string;
  nombre_empresa: string;
  color_marca: string;
  logo_url: string | null;
  privacy_url: string | null;
  precio_eur_kwp: number;
  tarifa_kwh_override: number | null;
  ratio_autoconsumo: number;
  kwp_max: number;
  gtm_id: string | null;
  plan?: "basic" | "pro" | null;
}

interface LocalidadOption {
  id: string;
  nombre: string;
  slug: string;
  provincia: string;
  ccaa: string;
}

export function WidgetSimulator({ empresa, preview = false }: { empresa: EmpresaWidget; preview?: boolean }) {
  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState<TipoInmueble>("residencial");
  const [ccaa, setCcaa] = useState("");
  const [localidades, setLocalidades] = useState<LocalidadOption[]>([]);
  const [localidadId, setLocalidadId] = useState("");
  const [localidadFull, setLocalidadFull] = useState<Localidad | null>(null);
  const [modoConsumo, setModoConsumo] = useState<"gasto" | "kwh">("gasto");
  const [gasto, setGasto] = useState("");
  const [kwh, setKwh] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rgpd, setRgpd] = useState(false);
  const [resultado, setResultado] = useState<SimulacionResultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDesglose, setShowDesglose] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [anosProyeccion, setAnosProyeccion] = useState(10);
  const [honeypot, setHoneypot] = useState("");

  const brandColor = empresa.color_marca;

  useEffect(() => {
    if (!ccaa) return;
    fetch(`/api/localidades?ccaa=${encodeURIComponent(ccaa)}`)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar las ciudades");
        return r.json();
      })
      .then((data: LocalidadOption[]) => {
        if (Array.isArray(data)) setLocalidades(data);
      })
      .catch(() => setLocalidades([]));
  }, [ccaa]);

  useEffect(() => {
    if (!localidadId) { setLocalidadFull(null); return; }
    fetch(`/api/localidades/${localidadId}`)
      .then((r) => r.json())
      .then((data: Localidad) => { if (data.id) setLocalidadFull(data); });
  }, [localidadId]);

  const syncFromGasto = useCallback(
    (val: string, loc: Localidad) => {
      const g = parseFloat(val);
      if (isNaN(g) || g <= 0) { setKwh(""); return; }
      const k = gastoToKwh(g, loc, tipo);
      setKwh(String(k));
    },
    [tipo],
  );

  const syncFromKwh = useCallback(
    (val: string, loc: Localidad) => {
      const k = parseFloat(val);
      if (isNaN(k) || k <= 0) { setGasto(""); return; }
      const g = kwhToGasto(k, loc, tipo);
      setGasto(String(g));
    },
    [tipo],
  );

  useEffect(() => {
    if (!localidadFull) return;
    if (modoConsumo === "gasto" && gasto) syncFromGasto(gasto, localidadFull);
    if (modoConsumo === "kwh" && kwh) syncFromKwh(kwh, localidadFull);
  }, [tipo, localidadFull, modoConsumo, gasto, kwh, syncFromGasto, syncFromKwh]);

  const desglose = useMemo(() => {
    if (!localidadFull || !kwh) return null;
    const k = parseFloat(kwh);
    if (isNaN(k)) return null;
    return desgloseFactura(k, localidadFull, tipo);
  }, [localidadFull, kwh, tipo]);

  const proyeccion = useMemo(() => {
    if (!resultado) return null;
    const anos = Math.min(30, Math.max(1, anosProyeccion));
    return calcularAhorroProyectado(resultado.ahorro_anual_eur, anos);
  }, [resultado, anosProyeccion]);

  async function submitLead() {
    if (!localidadFull || !rgpd) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const kwhNum = parseFloat(kwh);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_slug: empresa.slug,
          localidad_id: localidadFull.id,
          tipo_inmueble: tipo,
          nombre,
          email,
          telefono,
          gasto_mensual_eur: parseFloat(gasto) || undefined,
          consumo_kwh_mensual: kwhNum,
          campo_origen_consumo: modoConsumo,
          consentimiento_rgpd: true,
          website: honeypot,
          preview,
        }),
      });
      const json = (await res.json()) as { resultado?: SimulacionResultado; error?: string | { formErrors?: string[] } };
      if (!res.ok) {
        const msg = typeof json.error === "string"
          ? json.error
          : "Error al guardar el lead";
        setErrorMsg(msg);
        return;
      }
      setResultado(json.resultado ?? null);
      setStep(4);
      if (typeof window !== "undefined" && canUseGtm(empresa.plan) && empresa.gtm_id) {
        (window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
          event: "generate_lead",
          lead_source: preview ? "solarflow_preview" : "solarflow_widget",
        });
      }
    } catch {
      setErrorMsg("Error de conexión. Comprueba que el servidor está activo.");
    } finally {
      setLoading(false);
    }
  }

  function resetSimulator() {
    setStep(0);
    setTipo("residencial");
    setCcaa("");
    setLocalidadId("");
    setLocalidadFull(null);
    setGasto("");
    setKwh("");
    setNombre("");
    setEmail("");
    setTelefono("");
    setRgpd(false);
    setResultado(null);
    setErrorMsg("");
    setAnosProyeccion(10);
  }

  const steps = ["Tipo", "Ubicación", "Consumo", "Contacto", "Resultados"];
  const watermark = showWidgetWatermark(empresa.plan);

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-elevated" style={{ "--brand": brandColor } as React.CSSProperties}>
      <div className="px-6 py-5 text-white" style={{ backgroundColor: brandColor }}>
        <div className="flex items-center gap-3">
          {empresa.logo_url ? (
            <Image src={empresa.logo_url} alt="" width={40} height={40} className="rounded-lg bg-white/20 object-contain" />
          ) : (
            <Sun className="h-10 w-10" />
          )}
          <div>
            <p className="font-bold text-lg">{empresa.nombre_empresa}</p>
            <p className="text-sm opacity-90">Simulador solar gratuito</p>
          </div>
        </div>
        <div className="mt-4 flex gap-1">
          {steps.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {errorMsg && step < 4 && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMsg}
          </div>
        )}
        {preview && step < 4 && (
          <p className="text-xs text-center text-muted-foreground bg-muted rounded-md py-2">
            Modo prueba — se guarda en tu CRM como “Prueba” y no consume tu cuota mensual
          </p>
        )}
        {step === 0 && (
          <>
            <h2 className="font-semibold text-lg">¿Qué tipo de inmueble es?</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["residencial", "comercial"] as TipoInmueble[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-xl border-2 p-4 text-left capitalize transition-colors ${tipo === t ? "border-[var(--brand)] bg-muted" : "border-border"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-semibold text-lg">¿Dónde está ubicado?</h2>
            <div className="space-y-3">
              <div>
                <Label>Comunidad Autónoma</Label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={ccaa}
                  onChange={(e) => { setCcaa(e.target.value); setLocalidadId(""); }}
                >
                  <option value="">Selecciona...</option>
                  {CCAA_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Ciudad</Label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  value={localidadId}
                  onChange={(e) => setLocalidadId(e.target.value)}
                  disabled={!ccaa}
                >
                  <option value="">Selecciona ciudad...</option>
                  {localidades.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-lg">Tu consumo eléctrico</h2>
            <div className="flex rounded-lg border p-1">
              <button type="button" className={`flex-1 rounded-md py-2 text-sm ${modoConsumo === "gasto" ? "bg-muted font-medium" : ""}`} onClick={() => setModoConsumo("gasto")}>€/mes</button>
              <button type="button" className={`flex-1 rounded-md py-2 text-sm ${modoConsumo === "kwh" ? "bg-muted font-medium" : ""}`} onClick={() => setModoConsumo("kwh")}>kWh/mes</button>
            </div>
            {modoConsumo === "gasto" ? (
              <div>
                <Label>¿Cuánto pagas al mes?</Label>
                <Input type="number" value={gasto} onChange={(e) => { setModoConsumo("gasto"); setGasto(e.target.value); }} placeholder="85" className="mt-1" />
                {kwh && localidadFull && <p className="text-sm text-muted-foreground mt-1">≈ {kwh} kWh/mes según tarifas de {localidadFull.nombre}</p>}
              </div>
            ) : (
              <div>
                <Label>¿Cuántos kWh consumes al mes?</Label>
                <Input type="number" value={kwh} onChange={(e) => { setModoConsumo("kwh"); setKwh(e.target.value); }} placeholder="250" className="mt-1" />
                {gasto && localidadFull && <p className="text-sm text-muted-foreground mt-1">≈ {gasto} €/mes con impuestos incluidos</p>}
              </div>
            )}
            {desglose && (
              <div>
                <button type="button" className="text-sm underline text-muted-foreground" onClick={() => setShowDesglose(!showDesglose)}>
                  {showDesglose ? "Ocultar" : "Ver"} desglose de factura
                </button>
                {showDesglose && (
                  <div className="mt-2 rounded-lg bg-muted p-3 text-xs space-y-1">
                    <p>Energía: {desglose.termino_energia} €</p>
                    <p>Potencia ({desglose.potencia_kw} kW): {desglose.termino_potencia} €</p>
                    <p>Peajes y cargos: {desglose.peajes_cargos} €</p>
                    <p>IEE: {desglose.iee} €</p>
                    <p>Impuesto: {desglose.impuesto_final} €</p>
                    <p className="font-medium">Total: {desglose.total} €</p>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Basado en potencia típica {tipo === "residencial" ? "3,45 kW" : "10 kW"}</p>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-semibold text-lg">Datos de contacto</h2>
            <p className="text-sm text-muted-foreground">Completa para ver tu estudio de rentabilidad</p>
            <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1" /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
              <div><Label>Teléfono</Label><Input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1" /></div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={rgpd} onChange={(e) => setRgpd(e.target.checked)} className="mt-1" />
                <span>
                  Acepto el tratamiento de mis datos para recibir el estudio.
                  {empresa.privacy_url && <> <a href={empresa.privacy_url} target="_blank" rel="noopener noreferrer" className="underline">Política de privacidad</a></>}
                </span>
              </label>
            </div>
          </>
        )}

        {step === 4 && resultado && proyeccion && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: brandColor }}>¡Tu estudio está listo!</h2>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Instalación</p><p className="text-xl font-bold">{formatNumber(resultado.kwp_estimado)} kWp</p></div>
              <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Ahorro anual</p><p className="text-xl font-bold">{formatCurrency(resultado.ahorro_anual_eur)}</p></div>
              <div className="rounded-xl bg-muted p-4 col-span-2"><p className="text-xs text-muted-foreground">Recuperación inversión</p><p className="text-xl font-bold">{formatNumber(resultado.payback_anos)} años</p></div>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 text-left space-y-3">
              <div>
                <Label htmlFor="anos_proyeccion" className="text-sm font-medium">¿A cuántos años quieres proyectar el ahorro?</Label>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <Input
                    id="anos_proyeccion"
                    type="number"
                    min={1}
                    max={30}
                    value={anosProyeccion}
                    onChange={(e) => setAnosProyeccion(Number(e.target.value) || 10)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">años</span>
                  {[10, 15, 20, 25].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAnosProyeccion(a)}
                      className={`rounded-md px-2.5 py-1 text-xs border transition-colors ${anosProyeccion === a ? "bg-background font-medium border-[var(--brand)]" : "text-muted-foreground hover:bg-background"}`}
                    >
                      {a}a
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-4 text-center" style={{ backgroundColor: `${brandColor}15` }}>
                <p className="text-xs text-muted-foreground">Ahorro acumulado estimado a {proyeccion.anos} años</p>
                <p className="text-3xl font-bold mt-1" style={{ color: brandColor }}>
                  {formatCurrency(proyeccion.ahorro_total_eur)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Incluye inflación del {Math.round(INFLACION_ENERGIA_ANUAL * 100)}% anual en el precio de la electricidad
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{BRAND.disclaimer}</p>
            <p className="text-sm">Te contactaremos pronto con tu estudio personalizado gratuito.</p>
            {preview && (
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild variant="default" style={{ backgroundColor: brandColor }} className="text-white">
                  <Link href="/dashboard/crm">Ver lead en el CRM</Link>
                </Button>
                <Button variant="outline" onClick={resetSimulator}>
                  Probar otro lead
                </Button>
              </div>
            )}
          </div>
        )}

        {step < 4 && (
          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4" /> Atrás
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={(step === 1 && !localidadId) || (step === 2 && !kwh)}
                style={{ backgroundColor: brandColor }}
                className="text-white hover:opacity-90"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submitLead}
                disabled={loading || !nombre || !email || !telefono || !rgpd}
                style={{ backgroundColor: brandColor }}
                className="text-white hover:opacity-90"
              >
                {loading ? "Calculando..." : "Ver resultados"}
              </Button>
            )}
          </div>
        )}
      </div>

      {watermark && (
        <div className="border-t border-border bg-muted/50 px-4 py-2 text-center">
          <a
            href={getSiteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-400 transition-colors hover:text-gray-600"
          >
            Powered by {BRAND.name}
          </a>
        </div>
      )}
    </div>
  );
}
