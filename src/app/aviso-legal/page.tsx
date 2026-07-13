import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { BRAND } from "@/lib/config/brand";
import { LEGAL } from "@/lib/config/legal";
import { buildLandingMetadata } from "@/lib/config/seo";

export const metadata: Metadata = {
  ...buildLandingMetadata(),
  title: `Aviso legal | ${BRAND.name}`,
  description: `Información legal y datos del titular de ${BRAND.name}.`,
  alternates: { canonical: "/aviso-legal" },
};

export default function AvisoLegalPage() {
  return (
    <LegalPageShell title="Aviso legal" description="Información del titular del sitio web y del servicio.">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Datos identificativos</h2>
        <ul className="list-none space-y-2 pl-0">
          <li>
            <strong className="text-foreground">Titular:</strong> {LEGAL.legalName}
          </li>
          <li>
            <strong className="text-foreground">CIF/NIF:</strong> {LEGAL.cif}
          </li>
          <li>
            <strong className="text-foreground">Domicilio:</strong> {LEGAL.address}
          </li>
          <li>
            <strong className="text-foreground">Email de contacto:</strong>{" "}
            <a href={`mailto:${LEGAL.email}`} className="text-foreground underline-offset-4 hover:underline">
              {LEGAL.email}
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Objeto del sitio</h2>
        <p>
          Este sitio web ofrece información comercial sobre {BRAND.name}, plataforma SaaS para
          instaladoras solares, y permite el registro de clientes, acceso al panel de gestión y
          formulario de contacto.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Condiciones de uso</h2>
        <p>
          El acceso implica la aceptación de las{" "}
          <Link href="/terminos" className="text-foreground underline-offset-4 hover:underline">
            condiciones de servicio
          </Link>
          , la{" "}
          <Link href="/privacidad" className="text-foreground underline-offset-4 hover:underline">
            política de privacidad
          </Link>{" "}
          y la{" "}
          <Link href="/cookies" className="text-foreground underline-offset-4 hover:underline">
            política de cookies
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Propiedad intelectual</h2>
        <p>
          Los contenidos, marcas, logotipos y software de {BRAND.name} están protegidos por la
          normativa de propiedad intelectual. Queda prohibida su reproducción sin autorización.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Responsabilidad</h2>
        <p>
          {LEGAL.legalName} no se hace responsable del uso indebido del sitio por parte de terceros ni
          de enlaces externos. Las estimaciones del simulador solar son orientativas.
        </p>
      </section>
    </LegalPageShell>
  );
}
