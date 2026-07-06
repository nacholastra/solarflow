const steps = [
  {
    number: "01",
    title: "Configura tu simulador",
    body: "Ajusta colores, logo, precio por kWp y parámetros de autoconsumo desde el panel.",
  },
  {
    number: "02",
    title: "Embébelo en tu web",
    body: "Copia el código iframe y pégalo en tu página. Sin conocimientos técnicos.",
  },
  {
    number: "03",
    title: "Capta leads cualificados",
    body: "Los visitantes calculan su ahorro y dejan sus datos con consentimiento RGPD.",
  },
  {
    number: "04",
    title: "Gestiona y cierra",
    body: "Organiza cada lead en el CRM Kanban y llévalo hasta la instalación.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-16 border-b border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold text-solar">Cómo funciona</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            En marcha en cuatro pasos
          </h2>
        </div>

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
