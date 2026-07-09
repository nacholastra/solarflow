import Image from "next/image";
import { Check } from "lucide-react";
import { HeroCTAs } from "@/components/marketing/hero-ctas";

const highlights = [
  "Simulador embebible en tu web",
  "CRM Kanban para tus leads",
  "Integraciones con Zapier y Make",
];

export function HeroSection() {
  return (
    <section
      className="marketing-gradient relative overflow-hidden border-b border-border"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24 lg:py-28">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-positive" />
            Software para instaladoras fotovoltaicas
          </span>

          <h1
            id="hero-heading"
            className="mt-6 text-pretty text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]"
          >
            Convierte visitas en instalaciones solares
          </h1>

          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            SolarFlow integra un simulador de ahorro en tu web, captura leads cualificados y los
            organiza en un CRM pensado para equipos comerciales del sector solar.
          </p>

          <HeroCTAs />

          <ul className="mt-8 flex flex-col gap-2.5">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-positive/15 text-positive">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border/80 shadow-elevated">
            <Image
              src="/hero-solar-installation.png"
              alt="Instaladores colocando paneles solares en un tejado residencial"
              width={720}
              height={560}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border/80 bg-card/95 p-4 shadow-elevated backdrop-blur-sm sm:block">
            <p className="text-xs font-medium text-muted-foreground">Ahorro anual estimado</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">1.480 €</p>
            <p className="mt-0.5 text-xs font-medium text-positive">Payback en 6,2 años</p>
          </div>
        </div>
      </div>
    </section>
  );
}
