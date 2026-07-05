import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/config/brand";

const footerLinks = {
  Producto: [
    { href: "#features", label: "Funcionalidades" },
    { href: "#producto", label: "Simulador y CRM" },
    { href: "#precios", label: "Precios" },
    { href: "#how-it-works", label: "Cómo funciona" },
  ],
  Cuenta: [
    { href: "/register", label: "Registrarse" },
    { href: "/login", label: "Iniciar sesión" },
    { href: "#faq", label: "Preguntas frecuentes" },
  ],
  Legal: [
    { href: `mailto:${BRAND.supportEmail}`, label: "Contacto" },
    { href: "#", label: "Privacidad" },
    { href: "#", label: "Términos" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {BRAND.tagline}. La plataforma todo-en-uno para instaladoras que quieren captar,
              calcular y cerrar más proyectos solares.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border/60 py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
