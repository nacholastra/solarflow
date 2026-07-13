import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { BRAND } from "@/lib/config/brand";
import { buildLandingMetadata } from "@/lib/config/seo";

export const metadata: Metadata = {
  ...buildLandingMetadata(),
  title: `Política de cookies | ${BRAND.name}`,
  description: `Información sobre el uso de cookies en ${BRAND.name}.`,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPageShell title="Política de cookies" description="Qué cookies usamos y cómo gestionarlas.">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos que se almacenan en tu dispositivo al visitar una web. Nos
          ayudan a que el sitio funcione correctamente y, si lo aceptas, a medir el uso de forma
          agregada.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Cookies que utilizamos</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-semibold text-foreground">Tipo</th>
                <th className="py-2 pr-4 font-semibold text-foreground">Finalidad</th>
                <th className="py-2 font-semibold text-foreground">Duración</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/60">
                <td className="py-3 pr-4">Técnicas / sesión</td>
                <td className="py-3 pr-4">Autenticación en el panel, sesión admin, preferencia de tema</td>
                <td className="py-3">Sesión o persistente corta</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-3 pr-4">Consentimiento</td>
                <td className="py-3 pr-4">Recordar si aceptaste cookies de analítica</td>
                <td className="py-3">12 meses (localStorage)</td>
              </tr>
              <tr>
                <td className="py-3 pr-4">Analítica (opcional)</td>
                <td className="py-3 pr-4">
                  Google Analytics / Google Tag Manager, solo si aceptas en el banner
                </td>
                <td className="py-3">Según proveedor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Cómo gestionarlas</h2>
        <p>
          Al entrar en la web puedes aceptar solo cookies necesarias o aceptar también las de
          analítica. Puedes borrar cookies desde la configuración de tu navegador en cualquier
          momento.
        </p>
        <p>
          Más información en nuestra{" "}
          <Link href="/privacidad" className="text-foreground underline-offset-4 hover:underline">
            política de privacidad
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
