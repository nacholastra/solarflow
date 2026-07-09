import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/config/brand";

const benefits = [
  "Simulador de ahorro embebible en tu web",
  "CRM Kanban para no perder ningún lead",
  "Integraciones con Zapier y Make",
  "Cálculos de ahorro ajustados por ciudad",
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.79_0.155_76/0.18),transparent_55%)]"
        />
        <Link href="/" aria-label={`${BRAND.name} inicio`} className="relative z-10">
          <Logo inverted wordmarkClassName="text-primary-foreground" />
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
            {BRAND.tagline}
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {benefits.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-solar text-solar-foreground">
                  <Check className="size-3" />
                </span>
                <span className="text-primary-foreground/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center bg-muted/30 px-4 py-10 dark:bg-background md:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/" aria-label={`${BRAND.name} inicio`}>
              <Logo />
            </Link>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
