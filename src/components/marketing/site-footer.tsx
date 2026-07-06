import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/config/brand";

const columns = [
  {
    title: "Producto",
    links: [
      { label: "Widget simulador", href: "#funcionalidades" },
      { label: "CRM Kanban", href: "#funcionalidades" },
      { label: "Integraciones", href: "#funcionalidades" },
      { label: "Precios", href: "#precios" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contacto", href: `mailto:${BRAND.supportEmail}` },
      { label: "Soporte", href: `mailto:${BRAND.supportEmail}` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso legal", href: "#" },
      { label: "Privacidad", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "RGPD", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              El software de captación y gestión de leads para instaladoras de energía solar en
              España.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Acceder
            </Link>
            <Link
              href="/register"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
