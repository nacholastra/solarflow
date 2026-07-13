import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { BRAND } from "@/lib/config/brand";
import { LEGAL } from "@/lib/config/legal";
import { buildLandingMetadata } from "@/lib/config/seo";

export const metadata: Metadata = {
  ...buildLandingMetadata(),
  title: `Encargo de tratamiento (DPA) | ${BRAND.name}`,
  description: `Información sobre el tratamiento de datos en nombre de clientes B2B de ${BRAND.name}.`,
  alternates: { canonical: "/dpa" },
};

export default function DpaPage() {
  return (
    <LegalPageShell
      title="Encargo de tratamiento de datos (DPA)"
      description="Para clientes B2B que capturan leads de visitantes mediante el widget."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Roles</h2>
        <p>
          Cuando una instaladora utiliza el widget de {BRAND.name} para captar datos de visitantes de
          su web, la instaladora actúa como <strong className="text-foreground">responsable del tratamiento</strong>{" "}
          y {LEGAL.legalName} actúa como <strong className="text-foreground">encargado del tratamiento</strong>{" "}
          respecto a esos datos de leads.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Datos tratados</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Datos identificativos y de contacto del lead (nombre, email, teléfono).</li>
          <li>Datos de la simulación (consumo, localidad, resultados ROI).</li>
          <li>Metadatos técnicos (hash de IP, user-agent recortado, UTM).</li>
          <li>Registro de consentimiento RGPD marcado por el visitante.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Obligaciones del encargado</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Tratar los datos solo siguiendo las instrucciones del cliente (uso del CRM y exportaciones autorizadas).</li>
          <li>Aplicar medidas de seguridad: cifrado en tránsito, RLS multi-tenant, control de acceso.</li>
          <li>No subcontratar sin informar: infraestructura en Supabase (UE) y Vercel según región configurada.</li>
          <li>Asistir al cliente en solicitudes de derechos de los interesados cuando sea técnicamente posible.</li>
          <li>Suprimir o devolver datos al finalizar el contrato, salvo obligación legal de conservación.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Subencargados</h2>
        <p>Principales proveedores de infraestructura:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Supabase — base de datos y autenticación</li>
          <li>Vercel — hosting de la aplicación</li>
          <li>PayPal — facturación de la suscripción del cliente a {BRAND.name}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Contacto</h2>
        <p>
          Para cuestiones de protección de datos:{" "}
          <a href={`mailto:${LEGAL.email}`} className="text-foreground underline-offset-4 hover:underline">
            {LEGAL.email}
          </a>
          . Consulta también los{" "}
          <Link href="/terminos" className="text-foreground underline-offset-4 hover:underline">
            términos de servicio
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
