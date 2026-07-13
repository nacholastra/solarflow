import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { BRAND } from "@/lib/config/brand";
import { buildLandingMetadata } from "@/lib/config/seo";

export const metadata: Metadata = {
  ...buildLandingMetadata(),
  title: `Política de privacidad | ${BRAND.name}`,
  description: `Información sobre el tratamiento de datos personales en ${BRAND.name}.`,
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-20">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Política de privacidad</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última actualización: {new Date().getFullYear()}</p>

          <div className="prose prose-neutral mt-10 max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground dark:prose-invert">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">1. Responsable</h2>
              <p>
                {BRAND.name} es responsable del tratamiento de los datos recogidos a través de esta web
                y del servicio SaaS, salvo los leads capturados en el widget de cada instaladora, que son
                responsabilidad de la empresa cliente que configura su propia URL de privacidad.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">2. Datos que tratamos</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-foreground">Cuenta de cliente:</strong> email, contraseña (hash),
                  nombre de empresa, datos de facturación PayPal y configuración del simulador.
                </li>
                <li>
                  <strong className="text-foreground">Formulario de contacto:</strong> nombre, email,
                  empresa, teléfono (opcional) y mensaje.
                </li>
                <li>
                  <strong className="text-foreground">Leads del widget:</strong> datos introducidos por el
                  visitante final de la web del cliente (nombre, email, teléfono, simulación, consentimiento
                  RGPD).
                </li>
                <li>
                  <strong className="text-foreground">Datos técnicos:</strong> hash de IP (no IP en claro),
                  user-agent recortado y registros de seguridad para prevenir abuso.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">3. Finalidad y base legal</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>Gestionar tu cuenta y prestarte el servicio (ejecución del contrato).</li>
                <li>Responder consultas enviadas por el formulario de contacto (consentimiento).</li>
                <li>Facturación y cumplimiento legal (obligación legal / interés legítimo).</li>
                <li>Seguridad, rate limiting y prevención de fraude (interés legítimo).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">4. Conservación</h2>
              <p>
                Conservamos los datos mientras mantengas una cuenta activa o sea necesario para la finalidad
                indicada. Las consultas de contacto se conservan el tiempo necesario para gestionarlas y
                durante los plazos legales aplicables.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">5. Destinatarios</h2>
              <p>
                Utilizamos proveedores necesarios para operar el servicio: Supabase (base de datos y auth),
                Vercel (hosting), PayPal (pagos) y, opcionalmente, herramientas de analítica si están
                configuradas. No vendemos tus datos a terceros.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">6. Tus derechos</h2>
              <p>
                Puedes acceder, rectificar, suprimir, oponerte, limitar el tratamiento y solicitar la
                portabilidad mediante el{" "}
                <Link href="/#contacto" className="text-foreground underline-offset-4 hover:underline">
                  formulario de contacto
                </Link>
                , indicando el derecho que deseas ejercer. También puedes reclamar ante la AEPD.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">7. Seguridad</h2>
              <p>
                Aplicamos medidas técnicas y organizativas: cifrado en tránsito (HTTPS), control de acceso
                por roles, rate limiting, validación de entradas, honeypot antibot en formularios públicos y
                hash de IP para trazabilidad sin almacenar la dirección completa.
              </p>
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">8. Documentos legales</h2>
              <p>
                Consulta también nuestros{" "}
                <Link href="/terminos" className="text-foreground underline-offset-4 hover:underline">
                  términos de servicio
                </Link>
                ,{" "}
                <Link href="/aviso-legal" className="text-foreground underline-offset-4 hover:underline">
                  aviso legal
                </Link>
                ,{" "}
                <Link href="/cookies" className="text-foreground underline-offset-4 hover:underline">
                  política de cookies
                </Link>{" "}
                y el{" "}
                <Link href="/dpa" className="text-foreground underline-offset-4 hover:underline">
                  encargo de tratamiento (DPA)
                </Link>
                .
              </p>
            </section>
          </div>

          <p className="mt-10">
            <Link href="/" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
              ← Volver al inicio
            </Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
