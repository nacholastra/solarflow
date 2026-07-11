import { SectionHeader } from "@/components/marketing/section-header";

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
    title: "Publica el iframe",
    body: "Copia el código desde el panel y pégalo en tu web. Prueba antes con leads de test (no cuentan en la cuota).",
  },
  {
    number: "04",
    title: "Gestiona y automatiza",
    body: "Recibe leads en el Kanban. En Pro, exporta CSV o envía cada lead a Zapier/Make con webhooks.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-16 border-b border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <SectionHeader eyebrow="Cómo funciona" title="De registro a primer lead en cuatro pasos" />

        <ol className="mt-12 grid gap-8 md:grid-cols-4">
          {steps.map((step) => (
            <li key={step.number} className="flex flex-col gap-3">
              <span className="font-mono text-sm font-semibold text-solar">{step.number}</span>
              <span className="h-px w-full bg-border" />
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
