import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LEGAL } from "@/lib/config/legal";

export function LegalPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-20">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
          <p className="mt-2 text-sm text-muted-foreground">Última actualización: {LEGAL.lastUpdated}</p>

          <div className="prose prose-neutral mt-10 max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground dark:prose-invert">
            {children}
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-sm">
            <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
              ← Volver al inicio
            </Link>
            <Link href="/privacidad" className="text-muted-foreground underline-offset-4 hover:underline">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-muted-foreground underline-offset-4 hover:underline">
              Términos
            </Link>
            <Link href="/cookies" className="text-muted-foreground underline-offset-4 hover:underline">
              Cookies
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
