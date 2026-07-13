import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { BRAND } from "@/lib/config/brand";
import { TRIAL_DAYS } from "@/lib/config/trial";
import { buildLandingMetadata } from "@/lib/config/seo";

export const metadata: Metadata = {
  ...buildLandingMetadata(),
  title: `Centro de ayuda | ${BRAND.name}`,
  description: `Guía de configuración e instalación de ${BRAND.name} para instaladoras solares.`,
  alternates: { canonical: "/ayuda" },
};

const sections = [
  {
    title: "1. Crear tu cuenta",
    body: `Regístrate eligiendo plan Basic o Pro. Tendrás ${TRIAL_DAYS} días de prueba gratuita con acceso completo. Confirma tu email y accede al panel.`,
  },
  {
    title: "2. Configurar el simulador",
    body: "En Panel → Simulador personaliza color de marca, logo, parámetros ROI (€/kWp, autoconsumo, kWp máximo) y la URL de tu política de privacidad (obligatoria para RGPD en el widget).",
  },
  {
    title: "3. Instalar el widget en tu web",
    body: "Copia el código iframe que aparece en la sección Simulador y pégalo en tu CMS (WordPress, Webflow, HTML, etc.). El widget es responsive y se adapta al ancho del contenedor.",
  },
  {
    title: "4. Probar antes de publicar",
    body: "Usa el modo vista previa en el panel para simular un lead sin consumir tu cuota. Cuando estés listo, publica el iframe en tu web.",
  },
  {
    title: "5. Gestionar leads en el CRM",
    body: "Los leads aparecen en CRM con estados Kanban: Nuevo, Contactado, Visita, Presupuesto, Cerrado y Descartado. Añade notas y filtra por estado.",
  },
  {
    title: "6. Activar suscripción",
    body: `Antes de que termine el periodo de prueba (${TRIAL_DAYS} días), activa el pago con PayPal en Suscripción. Sin permanencia: puedes cancelar cuando quieras.`,
  },
  {
    title: "7. Plan Pro: webhooks y marca blanca",
    body: "Con Pro puedes quitar el watermark SolarFlow, conectar Google Tag Manager, exportar contactos a CSV y enviar leads a Zapier o Make mediante webhooks HTTPS.",
  },
  {
    title: "8. Invitar a tu equipo",
    body: "En Equipo, el administrador puede invitar comerciales por email. Cada invitado recibe un enlace válido 7 días.",
  },
];

export default function AyudaPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-20">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Centro de ayuda</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Guía rápida para poner {BRAND.name} en marcha en tu instaladora.
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
            <h2 className="text-base font-semibold text-foreground">¿Necesitas más ayuda?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Escríbenos desde el{" "}
              <Link href="/#contacto" className="font-medium text-foreground underline-offset-4 hover:underline">
                formulario de contacto
              </Link>{" "}
              o inicia sesión y visita{" "}
              <Link href="/dashboard/ayuda" className="font-medium text-foreground underline-offset-4 hover:underline">
                la ayuda en el panel
              </Link>
              .
            </p>
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
