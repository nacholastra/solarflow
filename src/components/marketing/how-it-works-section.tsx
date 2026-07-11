import { SectionHeader } from "@/components/marketing/section-header";
import { RevealOnScroll } from "@/components/marketing/reveal-on-scroll";

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    body: "Regístrate, elige Basic o Pro y activa la suscripción con PayPal. Sin permanencia.",
  },
  {
    number: "02",
    title: "Configura el simulador",
    body: "Ajusta color, logo, €/kWp, autoconsumo, kWp máximo y enlace a tu política de privacidad.",
  },
  {
    number: "03",
    title: "Publica en tu web",
    body: "Instala el widget desde tu panel. Prueba con leads de prueba antes de ir a producción.",
  },
  {
    number: "04",
    title: "Gestiona y automatiza",
    body: "Recibe leads en el Kanban. En Pro, exporta contactos en CSV o envía cada lead a Zapier o Make.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-16 border-b border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <RevealOnScroll>
          <SectionHeader eyebrow="Cómo funciona" title="De registro a primer lead en cuatro pasos" />
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
