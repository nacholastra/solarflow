import Link from "next/link";
import { LANDING_FAQS } from "@/lib/config/faq";
import { RevealOnScroll } from "@/components/marketing/reveal-on-scroll";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-16 border-b border-border bg-card" aria-labelledby="faq-heading">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-24">
        <RevealOnScroll>
          <div className="text-center">
            <span className="text-sm font-semibold text-solar">Preguntas frecuentes</span>
            <h2
              id="faq-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
            >
              Respuestas directas, sin rodeos
            </h2>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <div className="mt-10 divide-y divide-border overflow-hidden rounded-xl border border-border/60 shadow-soft">
            {LANDING_FAQS.map(({ question, answer }) => (
              <details key={question} className="group bg-card first:rounded-t-xl last:rounded-b-xl">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium transition-colors hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
                  {question}
                  <span
                    className="shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                    aria-hidden
                  >
                    ▾
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</div>
              </details>
            ))}
          </div>
        </RevealOnScroll>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          ¿Más dudas?{" "}
          <a href="#contacto" className="font-medium text-foreground underline-offset-4 hover:underline">
            Usa el formulario de contacto
          </a>{" "}
          o{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            crea tu cuenta
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
