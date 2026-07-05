import { BRAND } from "@/lib/config/brand";
import { LANDING_FAQS } from "@/lib/config/faq";

export function FaqSection() {
  return (
    <section id="faq" className="border-b border-border/60 py-24" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            FAQ
          </p>
          <h2 id="faq-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="mt-12 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {LANDING_FAQS.map(({ question, answer }) => (
            <details key={question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium transition-colors hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
                {question}
                <span
                  className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden
                >
                  ▾
                </span>
              </summary>
              <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</div>
            </details>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          ¿Más dudas? Escríbenos a{" "}
          <a
            href={`mailto:${BRAND.supportEmail}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {BRAND.supportEmail}
          </a>
        </p>
      </div>
    </section>
  );
}
