import { SectionHeader } from "@/components/marketing/section-header";
import Image from "next/image";
import {
  Calculator,
  Code2,
  KanbanSquare,
  MapPin,
  TrendingDown,
  Webhook,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/config/plans";

const problems = [
  {
    icon: TrendingDown,
    title: "Formularios que no cualifican",
    body: "Un “contacta con nosotros” genérico no muestra ahorro ni potencia. El visitante se va sin entender el valor.",
  },
  {
    icon: MapPin,
    title: "Presupuestos lentos",
    body: "Calcular a mano cada visita web consume tiempo comercial antes de saber si el lead merece una visita.",
  },
  {
    icon: KanbanSquare,
    title: "Leads dispersos",
    body: "Excel, WhatsApp y correo mezclados dificultan saber en qué fase está cada oportunidad.",
  },
];

const features = [
  {
    icon: Calculator,
    title: "Simulador en tu web",
    body: "Widget embebible por iframe. El visitante indica consumo y obtiene kWp, ahorro anual y payback estimados antes de dejar sus datos.",
  },
  {
    icon: MapPin,
    title: "Estimación por localidad",
    body: "Producción solar (PVGIS) y tarifas españolas por ciudad: peajes, cargos, IEE e IVA/IGIC. Siempre como orientación, no como proyecto ejecutivo.",
  },
  {
    icon: KanbanSquare,
    title: "CRM Kanban",
    body: "6 estados: Nuevo, Contactado, Visita, Presupuesto, Cerrado y Descartado. Arrastra tarjetas, añade notas y filtra leads de prueba.",
  },
  {
    icon: Webhook,
    title: "Automatización (Pro)",
    body: `Webhooks HTTPS a Zapier o Make. Exportación CSV, GTM en el widget y marca blanca incluidos en plan Pro (${PLANS.pro.priceEur} €/mes).`,
  },
];

export function FeaturesSection() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <SectionHeader
            eyebrow="El problema"
            title="Tu web genera visitas, pero no siempre genera oportunidades claras"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {problems.map((item) => (
              <div key={item.title} className="flex flex-col gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground">
                  <item.icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="scroll-mt-16 border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <SectionHeader
            eyebrow="Funcionalidades"
            title="Herramientas concretas, no un ERP genérico"
            description="SolarFlow cubre captación web y seguimiento comercial. No incluye diseño eléctrico, gestión de obra ni facturación de instalaciones."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <feature.icon className="size-5" />
                    </span>
                    <CardTitle className="mt-4 text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-border lg:min-h-[480px]">
              <Image
                src="/solar-rooftop-aerial.png"
                alt="Vista aérea de paneles solares instalados en un tejado"
                width={640}
                height={720}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full min-h-[320px] w-full object-cover object-center lg:min-h-[480px]"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-lg border border-border bg-card/95 p-4 backdrop-blur">
                <Code2 className="size-5 shrink-0 text-solar" />
                <p className="text-sm font-medium text-foreground">
                  Copia el iframe desde el panel. Vista previa incluida antes de publicar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
