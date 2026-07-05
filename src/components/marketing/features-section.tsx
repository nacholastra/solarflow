import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Globe, Kanban, MapPin, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Globe,
    title: "Widget con tu marca",
    description:
      "Embebe el simulador en tu web con iframe. Logo, colores corporativos y URL propia para cada instaladora.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    alt: "Dashboard de analítica en pantalla",
  },
  {
    icon: MapPin,
    title: "Cálculo hiperlocal",
    description:
      "Producción solar por ciudad (PVGIS), peajes, cargos, IEE e IVA/IGIC. El cliente introduce € o kWh y el sistema convierte automáticamente.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    alt: "Vivienda con instalación solar",
  },
  {
    icon: Kanban,
    title: "CRM comercial incluido",
    description:
      "Tablero Kanban, base de contactos, notas por lead y exportación CSV. Tu equipo comercial trabaja desde el primer día.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    alt: "Equipo comercial en reunión",
  },
  {
    icon: Plug,
    title: "Integraciones automáticas",
    description:
      "Cada lead nuevo se envía por webhook a Zapier, Make, HubSpot, Pipedrive o Google Sheets sin programar nada.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    alt: "Gráficos y métricas de negocio",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Funcionalidades
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Todo lo que una instaladora necesita para vender más
          </h2>
          <p className="mt-4 text-muted-foreground">
            De la primera visita a la web hasta el cierre comercial, en una sola plataforma.
          </p>
        </div>

        <div className="mt-20 space-y-24">
          {features.map(({ icon: Icon, title, description, image, alt }, i) => (
            <div
              key={title}
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
            >
              <div className={`relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 shadow-lg ${i % 2 === 1 ? "lg:[direction:ltr]" : ""}`}>
                <Image src={image} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
              </div>
              <div className={i % 2 === 1 ? "lg:[direction:ltr]" : ""}>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 ring-1 ring-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/register">
              Probar con mi empresa
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function MetricsStrip() {
  return (
    <section className="border-b border-border/60 bg-primary py-12 text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3">
        {[
          { icon: BarChart3, stat: "Proyección a 25 años", desc: "Con inflación del precio de la luz incluida" },
          { icon: MapPin, stat: "Por ciudad", desc: "Datos reales de producción y tarifa eléctrica" },
          { icon: Kanban, stat: "Pipeline visual", desc: "Nuevo → Contactado → Visita → Presupuesto → Cerrado" },
        ].map(({ icon: Icon, stat, desc }) => (
          <div key={stat} className="flex gap-4">
            <Icon className="h-8 w-8 shrink-0 text-amber-400" strokeWidth={1.5} />
            <div>
              <p className="font-semibold">{stat}</p>
              <p className="mt-1 text-sm text-primary-foreground/65">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
