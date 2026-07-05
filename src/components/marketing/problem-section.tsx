import Image from "next/image";
import { Target, TrendingDown, Zap } from "lucide-react";

const pains = [
  {
    icon: TrendingDown,
    title: "Visitas sin conversión",
    description:
      "Mucho tráfico en la web, pero pocos dejan datos porque no entienden el ahorro real de instalar placas.",
  },
  {
    icon: Target,
    title: "Presupuestos genéricos",
    description:
      "Calculadoras básicas que no consideran la tarifa eléctrica, impuestos ni la producción de cada ciudad.",
  },
  {
    icon: Zap,
    title: "Leads dispersos",
    description:
      "Formularios sueltos, Excel y WhatsApp. Sin pipeline claro ni seguimiento del equipo comercial.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 shadow-lg lg:aspect-auto lg:h-[520px]">
            <Image
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80"
              alt="Técnico instalando paneles solares"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              El problema
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Tu web genera curiosidad, pero no cierra oportunidades
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Las instaladoras invierten en publicidad y SEO, pero pierden ventas porque el visitante
              no ve un número claro de ahorro adaptado a su consumo y su ciudad.
            </p>
            <div className="mt-10 space-y-6">
              {pains.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/5 ring-1 ring-destructive/10">
                    <Icon className="h-5 w-5 text-destructive/70" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
