"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = (await res.json()) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "No se pudo iniciar sesión");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Panel de administración</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acceso restringido</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Usuario
            </Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? "Accediendo…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
