import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/config/brand";
import { TRIAL_DAYS } from "@/lib/config/trial";

const topics = [
  {
    title: "Simulador",
    description: "Personaliza marca, ROI y política de privacidad.",
    href: "/dashboard/simulator",
  },
  {
    title: "CRM",
    description: "Gestiona el pipeline de leads con Kanban.",
    href: "/dashboard/crm",
  },
  {
    title: "Integraciones",
    description: "Webhooks para Zapier y Make (plan Pro).",
    href: "/dashboard/integrations",
  },
  {
    title: "Equipo",
    description: "Invita comerciales a tu cuenta.",
    href: "/dashboard/team",
  },
  {
    title: "Suscripción",
    description: "Gestiona tu plan y el pago con PayPal.",
    href: "/dashboard/subscription",
  },
];

export default function DashboardAyudaPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Ayuda"
        description={`Recursos para sacar el máximo partido a ${BRAND.name}.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Guía de inicio</CardTitle>
          <CardDescription>
            Sigue estos pasos durante tus primeros {TRIAL_DAYS} días de prueba.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-3 pl-5">
            <li>Configura el simulador con tu color, logo y URL de privacidad.</li>
            <li>Copia el código iframe e instálalo en tu web.</li>
            <li>Prueba el widget en modo vista previa antes de publicar.</li>
            <li>Revisa los leads en el CRM cuando empiecen a llegar.</li>
            <li>Activa la suscripción antes de que termine el periodo de prueba.</li>
          </ol>
          <p>
            Guía completa en{" "}
            <Link href="/ayuda" className="font-medium text-foreground underline-offset-4 hover:underline">
              /ayuda
            </Link>
            . ¿Dudas?{" "}
            <Link href="/#contacto" className="font-medium text-foreground underline-offset-4 hover:underline">
              Contáctanos
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => (
          <Link key={topic.href} href={topic.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardHeader>
                <CardTitle className="text-base">{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
