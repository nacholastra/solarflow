import { MARKETING } from "@/lib/config/marketing";

export function TrustSection() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {MARKETING.trust.map((item) => (
            <li
              key={item.label}
              className="rounded-xl border border-border/60 bg-card px-4 py-3 text-center shadow-soft"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{item.value}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
