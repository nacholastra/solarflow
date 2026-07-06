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

const problems = [
  {
    icon: TrendingDown,
    title: "Leads que se enfrían",
    body: "Los formularios de contacto genéricos no cualifican al visitante ni transmiten el valor del ahorro solar.",
  },
  {
    icon: MapPin,
    title: "Cálculos manuales lentos",
    body: "Cada presupuesto exige horas de trabajo antes de saber si el cliente es realmente viable.",
  },
  {
    icon: KanbanSquare,
    title: "Sin proceso comercial claro",
    body: "Hojas de cálculo dispersas hacen que se pierdan oportunidades entre el primer contacto y el cierre.",
  },
];

const features = [
  {
    icon: Calculator,
    title: "Simulador de ahorro",
    body: "El visitante calcula su ahorro, potencia recomendada en kWp y periodo de amortización en segundos.",
  },
  {
    icon: MapPin,
    title: "Cálculo por ciudad",
    body: "Irradiación y precios ajustados a la localidad con PVGIS, peajes, cargos, IEE e IVA/IGIC.",
  },
  {
    icon: KanbanSquare,
    title: "CRM Kanban",
    body: "Arrastra cada lead por tu embudo: Nuevo, Contactado, Visita, Presupuesto, Cerrado.",
  },
  {
    icon: Webhook,
    title: "Integraciones webhook",
    body: "Envía automáticamente cada lead a Zapier o Make y conéctalo con tus herramientas.",
  },
];

export function FeaturesSection() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold text-solar">El reto del sector</span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Captar y cerrar clientes solares sigue siendo demasiado manual
            </h2>
          </div>
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
          <div className="max-w-2xl">
            <span className="text-sm font-semibold text-solar">Funcionalidades</span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Todo lo que necesitas para vender más instalaciones
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Una plataforma diseñada específicamente para el flujo de trabajo de las empresas
              instaladoras fotovoltaicas.
            </p>
          </div>

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

            <div className="relative overflow-hidden rounded-xl border border-border">
              <Image
                src="/solar-rooftop-aerial.png"
                alt="Vista aérea de paneles solares instalados en un tejado"
                width={640}
                height={720}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-lg border border-border bg-card/95 p-4 backdrop-blur">
                <Code2 className="size-5 shrink-0 text-solar" />
                <p className="text-sm font-medium text-foreground">
                  Embebe el widget en tu web con una sola línea de código iframe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
