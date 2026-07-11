import { Sun, TrendingUp, Calendar, Info } from "lucide-react";
import { MARKETING } from "@/lib/config/marketing";
import { SectionHeader } from "@/components/marketing/section-header";
import { RevealOnScroll } from "@/components/marketing/reveal-on-scroll";

export function ProductShowcase() {
  const { productExample } = MARKETING;

  return (
    <section id="producto" className="scroll-mt-16 border-b border-border bg-muted/20">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <RevealOnScroll>
          <SectionHeader
            align="center"
            eyebrow="El simulador"
            title="Lo que ve tu visitante antes de dejar sus datos"
            description="Un flujo guiado: tipo de inmueble, localidad, consumo y resultado con kWp, ahorro y payback. Después, formulario con consentimiento RGPD."
          />
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl border border-border bg-background shadow-elevated transition-shadow duration-500 hover:shadow-elevated">
            <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
              <span className="size-3 rounded-full bg-border" />
              <span className="size-3 rounded-full bg-border" />
              <span className="size-3 rounded-full bg-border" />
              <span className="ml-3 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                tuinstaladora.es/simulador
              </span>
            </div>

            <div className="flex items-start gap-2 border-b border-border bg-warning/20 px-4 py-2.5 text-xs text-warning-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <p>{productExample.disclaimer}</p>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-foreground">Resultado de simulación</h3>
                <p className="mt-1 text-sm text-muted-foreground">{productExample.location}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <ResultStat icon={TrendingUp} label="Ahorro anual est." value={productExample.stats.ahorro} accent />
                  <ResultStat icon={Sun} label="Potencia est." value={productExample.stats.kwp} />
                  <ResultStat icon={Calendar} label="Payback est." value={productExample.stats.payback} />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-primary p-5 text-primary-foreground">
                <p className="text-sm font-medium">Solicita tu estudio</p>
                <div className="mt-4 flex flex-col gap-2.5">
                  <div className="h-9 rounded-md bg-primary-foreground/10" />
                  <div className="h-9 rounded-md bg-primary-foreground/10" />
                  <div className="h-9 rounded-md bg-primary-foreground/10" />
                  <div className="mt-1 h-9 rounded-md bg-solar" />
                </div>
                <p className="mt-3 text-xs text-primary-foreground/70">
                  Checkbox RGPD obligatorio · enlace a tu política de privacidad
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
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
