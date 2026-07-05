import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#features", label: "Funcionalidades" },
  { href: "#producto", label: "Producto" },
  { href: "#precios", label: "Precios" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo href="/" />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {links.map(({ href, label }) => (
            <a key={href} href={href} className="transition-colors hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Empezar gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
