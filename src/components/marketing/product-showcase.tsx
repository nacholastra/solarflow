import { Sun, TrendingUp, Calendar } from "lucide-react";

export function ProductShowcase() {
  return (
    <section id="producto" className="scroll-mt-16 border-b border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold text-solar">El producto</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Un simulador que tus clientes entienden al instante
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl border border-border bg-background shadow-md">
          <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
            <span className="size-3 rounded-full bg-border" />
            <span className="size-3 rounded-full bg-border" />
            <span className="size-3 rounded-full bg-border" />
            <span className="ml-3 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
              tuinstaladora.es/simulador
            </span>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-foreground">Resultado de tu simulación</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Vivienda unifamiliar · Sevilla · Consumo 180 €/mes
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <ResultStat icon={TrendingUp} label="Ahorro anual" value="1.480 €" accent />
                <ResultStat icon={Sun} label="Potencia" value="4,2 kWp" />
                <ResultStat icon={Calendar} label="Amortización" value="6,2 años" />
              </div>

              <div className="mt-6 rounded-lg border border-border bg-muted p-4">
                <div className="flex items-end justify-between gap-2">
                  {[35, 50, 62, 74, 85, 100].map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t bg-solar" style={{ height: `${h}px` }} />
                      <span className="text-[10px] text-muted-foreground">A{i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Ahorro acumulado proyectado a 6 años
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-primary p-5 text-primary-foreground">
              <p className="text-sm font-medium">Solicita tu estudio gratuito</p>
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="h-9 rounded-md bg-primary-foreground/10" />
                <div className="h-9 rounded-md bg-primary-foreground/10" />
                <div className="h-9 rounded-md bg-primary-foreground/10" />
                <div className="mt-1 h-9 rounded-md bg-solar" />
              </div>
              <p className="mt-3 text-xs text-primary-foreground/60">
                Datos protegidos según el RGPD
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultStat({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Icon className={accent ? "size-4 text-positive" : "size-4 text-muted-foreground"} />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p
        className={
          accent ? "text-xl font-semibold text-positive" : "text-xl font-semibold text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}
