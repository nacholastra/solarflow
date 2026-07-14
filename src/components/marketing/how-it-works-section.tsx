import { SectionHeader } from "@/components/marketing/section-header";
import { RevealOnScroll } from "@/components/marketing/reveal-on-scroll";

const steps = [
  {
    number: "01",
    title: "Empieza la prueba gratis",
    body: "Crea la cuenta, elige Basic o Pro y entra al panel. Tienes 14 días para ver valor antes de pagar.",
  },
  {
    number: "02",
    title: "Hazlo tuyo",
    body: "Ajusta color, logo, €/kWp y privacidad. Cada cambio deja el simulador con tu marca.",
  },
  {
    number: "03",
    title: "Prueba y publica",
    body: "Genera un lead de vista previa (no consume cuota) y copia el iframe a tu web.",
  },
  {
    number: "04",
    title: "Gestiona y automatiza",
    body: "Recibe leads en el Kanban. En Pro, exporta CSV o conecta Zapier y Make.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-16 border-b border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <RevealOnScroll>
          <SectionHeader eyebrow="Cómo funciona" title="De la prueba al primer lead, en cuatro pasos" />
        </RevealOnScroll>

        <ol className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.number}>
              <RevealOnScroll delay={index * 90} className="h-full">
                <div className="flex h-full flex-col gap-3">
                  <span className="font-mono text-sm font-semibold text-solar">{step.number}</span>
                  <span className="h-px w-full bg-border" />
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
