import { Check } from "lucide-react";

export function ProductShowcase() {
  return (
    <section id="producto" className="border-b border-border/60 bg-muted/20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            El producto
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Así ve tu cliente y así lo gestionas tú
          </h2>
          <p className="mt-4 text-muted-foreground">
            Un simulador profesional en tu web y un panel privado para tu equipo comercial.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Widget mockup */}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl">
            <div className="border-b border-border/60 bg-muted/50 px-4 py-2.5">
              <p className="text-xs font-medium text-muted-foreground">Vista del visitante · Widget embebido</p>
            </div>
            <div className="p-6">
              <div className="mx-auto max-w-sm rounded-xl border border-border bg-background p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20" />
                  <span className="text-sm font-semibold">Tu Instaladora Solar</span>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full rounded-full bg-muted" />
                  <div className="h-2 w-4/5 rounded-full bg-muted" />
                  <div className="rounded-lg bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
                    <p className="text-xs text-muted-foreground">Ahorro anual estimado</p>
                    <p className="text-2xl font-bold text-emerald-700">892 €</p>
                    <p className="mt-1 text-xs text-muted-foreground">Instalación ~4,2 kWp · Madrid</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted/60 p-2">
                      <p className="text-muted-foreground">Payback</p>
                      <p className="font-semibold">6,2 años</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-2">
                      <p className="text-muted-foreground">20 años</p>
                      <p className="font-semibold">18.400 €</p>
                    </div>
                  </div>
                </div>
              </div>
              <ul className="mt-6 space-y-2">
                {["Multi-step con datos de consumo", "Proyección con inflación", "Captura de lead con RGPD"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-[oklch(0.16_0.02_260)] shadow-xl">
            <div className="border-b border-white/10 px-4 py-2.5">
              <p className="text-xs font-medium text-white/50">Vista del instalador · Panel privado</p>
            </div>
            <div className="flex min-h-[340px]">
              <div className="w-14 shrink-0 border-r border-white/10 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`mb-2 h-6 rounded ${i === 2 ? "bg-white/15" : "bg-white/5"}`} />
                ))}
              </div>
              <div className="flex-1 p-4">
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {["12 leads", "5 nuevos", "22% conv."].map((s) => (
                    <div key={s} className="rounded-lg bg-white/5 p-2 text-center">
                      <p className="text-[10px] text-white/40">Métrica</p>
                      <p className="text-xs font-semibold text-white/90">{s}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {["Nuevo", "Contactado", "Visita", "Presupuesto", "Cerrado", "Descartado"].map((col, i) => (
                    <div key={col} className="rounded-lg bg-white/5 p-2">
                      <p className="mb-1.5 text-[9px] font-medium text-white/50">{col}</p>
                      {i < 3 && (
                        <div className="rounded bg-white/10 p-1.5">
                          <p className="text-[8px] font-medium text-white/80">Lead #{i + 1}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ul className="border-t border-white/10 p-4 space-y-2">
              {["CRM Kanban drag & drop", "Equipo multiusuario", "Webhook a Zapier/Make"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-white/60">
                  <Check className="h-4 w-4 text-amber-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
