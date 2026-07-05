import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1400&q=80"
              alt=""
              fill
              className="object-cover"
              sizes="1200px"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80" />

          <div className="relative grid gap-10 px-8 py-16 md:grid-cols-2 md:items-center md:px-16 md:py-20">
            <div className="text-primary-foreground">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                ¿Listo para captar más clientes solares?
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/75">
                Únete a las instaladoras que convierten visitas web en oportunidades comerciales
                con datos reales y un CRM pensado para el sector fotovoltaico.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button
                size="lg"
                className="h-12 bg-white px-8 text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/register">
                  Crear cuenta ahora
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/30 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
