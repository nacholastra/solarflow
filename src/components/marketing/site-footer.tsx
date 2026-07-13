import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/config/brand";

const columns = [
  {
    title: "Producto",
    links: [
      { label: "Simulador", href: "#producto" },
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Precios", href: "#precios" },
      { label: "FAQ", href: "#faq" },
      { label: "Ayuda", href: "/ayuda" },
      { label: "Contacto", href: "#contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "/privacidad" },
      { label: "Términos", href: "/terminos" },
      { label: "Aviso legal", href: "/aviso-legal" },
      { label: "Cookies", href: "/cookies" },
      { label: "DPA", href: "/dpa" },
      { label: "Acceder", href: "/login" },
      { label: "Crear cuenta", href: "/register" },
    ],
  },
];

const trustItems = ["PVGIS", "RGPD", "14 días gratis", "−30% early bird", "Sin permanencia"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              El software de captación y gestión de leads para instaladoras de energía solar en
              España.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {trustItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
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
              className="text-sm font-medium text-foreground transition-colors hover:text-solar"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
