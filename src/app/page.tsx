import Link from "next/link";
import { BRAND } from "@/lib/config/brand";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Sun className="h-7 w-7 text-amber-500" />
          {BRAND.name}
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Empezar gratis</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Capta leads solares con un simulador de rentabilidad en tu web
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          {BRAND.tagline}. Widget embebible + CRM Kanban para instaladoras en España.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Crear cuenta</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Acceder al dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
