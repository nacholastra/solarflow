import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { BRAND } from "@/lib/config/brand";
import { LEGAL } from "@/lib/config/legal";
import { TRIAL_DAYS } from "@/lib/config/trial";
import { buildLandingMetadata } from "@/lib/config/seo";

export const metadata: Metadata = {
  ...buildLandingMetadata(),
  title: `Términos de servicio | ${BRAND.name}`,
  description: `Condiciones de uso del servicio ${BRAND.name} para instaladoras solares.`,
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <LegalPageShell
      title="Términos de servicio"
      description="Condiciones aplicables al uso de la plataforma SaaS de SolarFlow."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Identificación</h2>
        <p>
          El presente contrato regula el acceso y uso de {BRAND.name}, plataforma SaaS de simulación
          solar y gestión de leads, titularidad de <strong className="text-foreground">{LEGAL.legalName}</strong>
          {LEGAL.cif !== "Pendiente de asignación" && <> (CIF {LEGAL.cif})</>}, con domicilio en{" "}
          {LEGAL.address}. Contacto:{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-foreground underline-offset-4 hover:underline">
            {LEGAL.email}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Objeto del servicio</h2>
        <p>
          {BRAND.name} proporciona a instaladoras y empresas del sector fotovoltaico una herramienta de
          simulación embebible en su web, un CRM para gestionar leads y funcionalidades asociadas según
          el plan contratado (Basic o Pro).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Registro y cuenta</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Debes ser mayor de edad y tener capacidad para contratar en nombre de tu empresa.</li>
          <li>
            Los datos de registro deben ser veraces. Eres responsable de la confidencialidad de tus
            credenciales.
          </li>
          <li>
            Al registrarte aceptas estos términos y nuestra{" "}
            <Link href="/privacidad" className="text-foreground underline-offset-4 hover:underline">
              política de privacidad
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Periodo de prueba y suscripción</h2>
        <p>
          Las nuevas cuentas incluyen un periodo de prueba gratuito de {TRIAL_DAYS} días con acceso al
          plan elegido en el registro. Tras el periodo de prueba, debes activar una suscripción de pago
          para continuar recibiendo leads en el widget.
        </p>
        <p>
          Los precios se indican en la landing (IVA no incluido). La facturación es mensual a través de
          PayPal, sin permanencia. Puedes cancelar en cualquier momento desde el panel de suscripción.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Uso aceptable</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>No utilizar el servicio para actividades ilegales, spam o recopilación fraudulenta de datos.</li>
          <li>
            Como cliente, eres responsable del tratamiento de los datos de los visitantes que capturas con
            el widget y debes cumplir el RGPD (incluida tu propia política de privacidad enlazada en el
            simulador).
          </li>
          <li>No intentar eludir límites técnicos del plan ni acceder a datos de otras empresas.</li>
          <li>Las estimaciones del simulador son orientativas y no sustituyen un estudio técnico.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">6. Propiedad intelectual</h2>
        <p>
          {BRAND.name}, su software, diseño y documentación son propiedad de {LEGAL.legalName}. Se te
          concede una licencia limitada, no exclusiva y revocable para usar el servicio según tu plan.
          Los datos y leads que generes son tuyos.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">7. Disponibilidad y limitación de responsabilidad</h2>
        <p>
          El servicio se presta &quot;tal cual&quot;, con esfuerzos razonables de disponibilidad. No
          garantizamos resultados comerciales concretos derivados del uso del simulador. En la medida
          permitida por la ley, nuestra responsabilidad se limita al importe abonado en los últimos 12
          meses.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">8. Resolución</h2>
        <p>
          Puedes eliminar tu cuenta desde el panel. Podemos suspender o cancelar el acceso por
          incumplimiento grave de estos términos o impago. Tras la cancelación, conservaremos datos el
          tiempo necesario para obligaciones legales.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">9. Ley aplicable</h2>
        <p>
          Estos términos se rigen por la legislación española. Para consumidores y empresas, los
          tribunales competentes serán los del domicilio del usuario en España, salvo norma imperativa
          en contrario.
        </p>
      </section>
    </LegalPageShell>
  );
}
