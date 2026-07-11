"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

const navLinks = [
  { label: "Simulador", href: "#producto" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(Boolean(session));
    });
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast({ title: "Sesión cerrada" });
    setOpen(false);
    router.refresh();
    setLoggingOut(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Logo href="/" />

        <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="lg" onClick={handleLogout} disabled={loggingOut}>
                Cerrar sesión
              </Button>
              <Button size="lg" asChild>
                <Link href="/dashboard">Ir al panel</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/login">Acceder al panel</Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/register">Crear cuenta</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav
            aria-label="Navegación móvil"
            className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
                    Cerrar sesión
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard">Ir al panel</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">Acceder al panel</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Crear cuenta</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
