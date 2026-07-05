import Link from "next/link";
import { ArrowLeft, BarChart3, Kanban, Zap } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/config/brand";

const highlights = [
  { icon: Zap, text: "Simulador embebible con ROI por localidad" },
  { icon: Kanban, text: "CRM Kanban para gestionar tus leads" },
  { icon: BarChart3, text: "Métricas y límites de plan en tiempo real" },
];

export function AuthShell({
  children,
  backHref = "/",
}: {
  children: React.ReactNode;
  backHref?: string;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.35_0.06_260)_0%,_transparent_55%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative">
          <Logo inverted />
        </div>

        <div className="relative space-y-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              Plataforma B2B
            </p>
            <h1 className="mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
              {BRAND.tagline}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              Capta leads cualificados desde tu web, calcula la rentabilidad solar al detalle
              y gestiona todo el pipeline comercial en un solo lugar.
            </p>
          </div>

          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/75">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-amber-400" strokeWidth={2} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
        </p>
      </aside>

      <div className="flex flex-1 flex-col bg-background">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="lg:hidden">
            <Logo href="/" />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
