import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/config/brand";
import { LANDING_FAQS } from "@/lib/config/faq";
import { Button } from "@/components/ui/button";

export function FaqSection() {
  return (
    <>
      <section id="faq" className="scroll-mt-16 border-b border-border bg-card" aria-labelledby="faq-heading">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-24">
          <div className="text-center">
            <span className="text-sm font-semibold text-solar">Preguntas frecuentes</span>
            <h2
              id="faq-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
            >
              Resolvemos tus dudas
            </h2>
          </div>

          <div className="mt-10 divide-y divide-border overflow-hidden rounded-xl border border-border/60 shadow-soft">
            {LANDING_FAQS.map(({ question, answer }) => (
              <details key={question} className="group bg-card first:rounded-t-xl last:rounded-b-xl">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium transition-colors hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
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

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="flex flex-col items-center rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground md:px-12">
            <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Empieza a captar más instalaciones hoy
            </h2>
            <p className="mt-4 max-w-md text-pretty text-lg leading-relaxed text-primary-foreground/70">
              Crea tu cuenta, configura tu simulador y publícalo en tu web en cuestión de minutos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Crear cuenta
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link href="/login">Acceder al panel</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
