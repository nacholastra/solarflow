import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { BRAND } from "@/lib/config/brand";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Plataforma B2B para instaladoras en España
          </p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]">
            Capta más clientes solares con un simulador que{" "}
            <span className="text-muted-foreground">vende por ti</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            {BRAND.name} convierte visitantes de tu web en leads cualificados con cálculos de
            rentabilidad reales por ciudad, impuestos incluidos y un CRM listo para tu equipo comercial.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Simulador embebible con tu marca y colores",
              "ROI por localidad con datos PVGIS y tarifas reales",
              "CRM Kanban + integración con Zapier y Make",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/register">
                Solicitar acceso
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="#producto">
                <Play className="mr-1 h-4 w-4" />
                Ver el producto
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sin permanencia · Configuración en menos de 30 minutos · Soporte en español
          </p>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/80 shadow-2xl shadow-black/10 ring-1 ring-black/5">
            <Image
              src="https://images.unsplash.com/photo-1508514177221-1881a7f647ea?w=1200&q=80"
              alt="Instalación de paneles solares en tejado residencial"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:bg-zinc-900/95">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Lead captado hoy</p>
                  <p className="text-lg font-semibold tracking-tight">María G. · Madrid</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ahorro estimado</p>
                  <p className="text-lg font-semibold text-emerald-600">847 €/año</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -top-4 hidden rounded-xl border border-border bg-card px-4 py-3 shadow-lg lg:block">
            <p className="text-2xl font-semibold tracking-tight">+38%</p>
            <p className="text-xs text-muted-foreground">más leads cualificados</p>
          </div>
        </div>
      </div>
    </section>
  );
}
