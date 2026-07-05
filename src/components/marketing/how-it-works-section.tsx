const steps = [
  {
    step: "01",
    title: "Registra tu instaladora",
    description: "Crea tu cuenta, elige plan Basic o Pro y accede al panel de configuración.",
  },
  {
    step: "02",
    title: "Personaliza el simulador",
    description: "Sube tu logo, define colores, precio por kWp y parámetros de autoconsumo.",
  },
  {
    step: "03",
    title: "Embebe en tu web",
    description: "Copia el código iframe o comparte la URL del widget. Empieza a captar leads hoy.",
  },
  {
    step: "04",
    title: "Cierra más ventas",
    description: "Gestiona el pipeline en el CRM, exporta datos o conéctalo a tus herramientas.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-border/60 bg-muted/20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Operativo en menos de 30 minutos
          </h2>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ step, title, description }) => (
            <div key={step} className="relative rounded-xl border border-border/60 bg-card p-6">
              <span className="text-4xl font-semibold tracking-tighter text-border">{step}</span>
              <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
