const stats = [
  { value: "6", label: "Comunidades autónomas cubiertas" },
  { value: "PVGIS", label: "Datos de producción solar reales" },
  { value: "25–250", label: "Leads/mes según plan" },
  { value: "RGPD", label: "Consentimiento y privacidad" },
];

export function TrustBar() {
  return (
    <section className="border-b border-border/60 bg-muted/30 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center md:text-left">
            <p className="text-xl font-semibold tracking-tight md:text-2xl">{value}</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground md:text-sm">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
